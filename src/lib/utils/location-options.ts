import type { LocationOptionSection, LocationProperties } from "@/types/types";

/**
 * Groups locations into the state-sectioned shape the header's city select
 * expects. Pure and isomorphic so routes that already ship `locations` to the
 * client can derive the options there instead of serializing a second,
 * fully-derivable copy of the same cities into the RSC payload.
 */
export const groupLocationsByState = (
  locations: readonly Pick<
    LocationProperties,
    "city" | "location_id" | "state"
  >[],
): LocationOptionSection[] => {
  const groupedByState = new Map<
    string,
    Array<{ key: number; title: string }>
  >();

  for (const { city, location_id, state } of locations) {
    const stateLocations = groupedByState.get(state);
    if (stateLocations) {
      stateLocations.push({ key: location_id, title: city });
    } else {
      groupedByState.set(state, [{ key: location_id, title: city }]);
    }
  }

  return [...groupedByState.entries()]
    .toSorted((a, b) => a[0].localeCompare(b[0]))
    .map(([state, stateLocations]) => ({
      items: stateLocations.toSorted((a, b) => a.title.localeCompare(b.title)),
      title: state,
    }));
};
