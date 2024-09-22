import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownSection,
} from "@nextui-org/react";
import { NavProps } from "./types";
import { usePathname, useSearchParams } from "next/navigation";
interface IconProps {
  fill: string;
  size: number;
}
const DownIcon = ({ fill, size }: IconProps) => {
  return (
    <svg
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  );
};

export const HeaderBar = ({ LocationOptions, id }: NavProps): JSX.Element => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const selected_id = id ? new Set([id]) : new Set([]);
  return (
    <div className="grid-cols-1 grid gap-2 justify-items-center">
      <div>
        <h1 className="text-2xl font-extrabold dark:text-white">
          PET in US cities from 2000-2023
        </h1>
      </div>
      <div>
        <Navbar
          isBordered
          classNames={{
            item: [
              "flex",
              "relative",
              "h-full",
              "items-center",
              "data-[active=true]:after:content-['']",
              "data-[active=true]:after:absolute",
              "data-[active=true]:after:bottom-0",
              "data-[active=true]:after:left-0",
              "data-[active=true]:after:right-0",
              "data-[active=true]:after:h-[2px]",
              "data-[active=true]:after:rounded-[2px]",
              "data-[active=true]:after:bg-primary",
            ],
          }}
        >
          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem isActive={pathname === "/"}>
              <Link
                color="foreground"
                href={
                  searchParams.toString() !== ""
                    ? `/?${searchParams.toString()}`
                    : `/`
                }
              >
                Map
              </Link>
            </NavbarItem>
            <Dropdown>
              <NavbarItem isActive={id! >= 0}>
                <DropdownTrigger>
                  <Button
                    disableRipple
                    className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                    endContent={<DownIcon fill="currentColor" size={16} />}
                    radius="sm"
                    variant="light"
                  >
                    {id! >= 0 ? `Change City` : "View data for City"}
                  </Button>
                </DropdownTrigger>
              </NavbarItem>
              <DropdownMenu
                selectionMode="single"
                selectedKeys={selected_id}
                className="max-h-[50vh] overflow-y-auto"
              >
                {LocationOptions.map((section) => (
                  <DropdownSection
                    key={section.title}
                    showDivider
                    items={section.items}
                    title={section.title}
                  >
                    {(option) => (
                      <DropdownItem
                        href={
                          searchParams.toString() !== ""
                            ? `/${option.key}?${searchParams.toString()}`
                            : `/${option.key}`
                        }
                        key={option.key}
                      >
                        {option.title}
                      </DropdownItem>
                    )}
                  </DropdownSection>
                ))}
              </DropdownMenu>
            </Dropdown>
            <NavbarItem isActive={pathname === "/about"}>
              <Link color="foreground" href="/about">
                About
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                color="foreground"
                href="https://github.com/porteken/pet-app"
              >
                Github Repository
              </Link>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </div>
    </div>
  );
};
