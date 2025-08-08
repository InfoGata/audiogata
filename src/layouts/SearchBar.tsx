import usePluginWithMethod from "@/hooks/useSearchPlugin";
import { useNavigate } from "@tanstack/react-router";
import { Command as CommandPrimitive } from "cmdk";
import { debounce } from "lodash";
import React from "react";
import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";

const SearchBar: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const searchPlugin = usePluginWithMethod("onGetSearchSuggestions");
  const [options, setOptions] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState("");

  const onGetSuggestions = React.useCallback(
    async (query: string) => {
      if (searchPlugin) {
        const suggestions = await searchPlugin.remote.onGetSearchSuggestions({
          query,
        });
        return suggestions;
      }
    },
    [searchPlugin]
  );

  const getSuggestionDebounce = React.useMemo(
    () =>
      debounce(
        (
          request: string,
          callback: (suggestions: string[] | undefined) => void
        ) => {
          onGetSuggestions(request).then((data) => {
            callback(data);
          });
        },
        500
      ),
    [onGetSuggestions]
  );

  React.useEffect(() => {
    let active = true;
    if (search === "") {
      setOptions([]);
      return;
    }
    if (selected === search) {
      return;
    }

    getSuggestionDebounce(search, (suggestions) => {
      if (active) {
        if (suggestions) {
          setOptions(suggestions);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [search, selected, getSuggestionDebounce]);

  const onValueChange = (value: string) => {
    setSearch(value);
  };

  const handleBlur = () => {
    setOpen(false);
  };

  const searchQuery = (query: string) => {
    navigate({ to: "/search", search: { q: query } });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) {
      setOpen(true);
    }

    if (event.key === "Enter") {
      searchQuery(search);
    }
  };

  const handleFocus = () => {
    setOpen(true);
  };

  const handleSelect = (option: string) => {
    setSelected(option);
    searchQuery(option);
    setSearch(option);
    setOpen(false);
  };

  return (
    <CommandPrimitive
      onKeyDown={handleKeyDown}
      className="rounded-full border flex-1"
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Search"
        onValueChange={onValueChange}
        value={search}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
      <div className="relative">
        {open && (
          <div className="absolute top-1 z-50 w-full rounded-xl bg-popover outline-none animate-in fade-in-0 zoom-in-95">
            <CommandList className="ring-1 ring-border rounded-lg">
              {options.length > 0 && (
                <CommandGroup>
                  {options.map((result) => (
                    <CommandItem
                      key={result}
                      value={result}
                      onSelect={handleSelect}
                      onMouseDown={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                      }}
                    >
                      {result}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </div>
        )}
      </div>
    </CommandPrimitive>
  );
};

export default SearchBar;
