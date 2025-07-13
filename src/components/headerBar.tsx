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
import { usePathname, useSearchParams } from "next/navigation";

import { APP_CONFIG } from "@/utils/constants";

import { NavProps } from "./types";

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
      aria-hidden="true"
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

  const buildUrl = (path: string, includeSearchParams = true) => {
    const baseUrl = path;
    if (includeSearchParams && searchParams.toString() !== "") {
      return `${baseUrl}?${searchParams.toString()}`;
    }
    return baseUrl;
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full">
      <div className="grid grid-cols-1 justify-items-center gap-2">
        <div>
          <h1 className="text-center text-2xl font-extrabold dark:text-white">
            {APP_CONFIG.NAME}
          </h1>
        </div>
        <div className="w-full max-w-4xl">
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
            <NavbarContent className="hidden gap-4 sm:flex" justify="center">
              <NavbarItem isActive={isActive("/")}>
                <Link
                  color="foreground"
                  href={buildUrl("/")}
                  aria-label="Navigate to map view"
                >
                  Map
                </Link>
              </NavbarItem>

              <Dropdown>
                <NavbarItem isActive={id! >= 0}>
                  <DropdownTrigger>
                    <Button
                      disableRipple
                      className="bg-transparent p-0 data-[hover=true]:bg-transparent"
                      endContent={<DownIcon fill="currentColor" size={16} />}
                      radius="sm"
                      variant="light"
                      aria-label="Select city to view data"
                    >
                      {id! >= 0 ? "Change City" : "View data for City"}
                    </Button>
                  </DropdownTrigger>
                </NavbarItem>
                <DropdownMenu
                  selectionMode="single"
                  selectedKeys={selected_id}
                  className="max-h-[50vh] overflow-y-auto"
                  aria-label="City selection dropdown"
                >
                  {LocationOptions.map(section => (
                    <DropdownSection
                      key={section.title}
                      showDivider
                      items={section.items}
                      title={section.title}
                    >
                      {option => (
                        <DropdownItem
                          href={buildUrl(`/${option.key}`)}
                          key={option.key}
                          aria-label={`View data for ${option.title}`}
                        >
                          {option.title}
                        </DropdownItem>
                      )}
                    </DropdownSection>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <NavbarItem isActive={isActive("/about")}>
                <Link
                  color="foreground"
                  href="/about"
                  aria-label="Navigate to about page"
                >
                  About
                </Link>
              </NavbarItem>

              <NavbarItem>
                <Link
                  color="foreground"
                  href={APP_CONFIG.GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View source code on GitHub"
                >
                  Github Repository
                </Link>
              </NavbarItem>
            </NavbarContent>
          </Navbar>
        </div>
      </div>
    </header>
  );
};
