import React from "react";
import { Filter } from "../plugintypes";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface FilterComponentProps {
  filter: Filter;
  onValueChange: (filter?: Filter) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = (props) => {
  const { filter, onValueChange } = props;

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const newFilter: Filter = { ...filter, value };
    onValueChange(newFilter);
  };

  const onChange = (value: string) => {
    const newFilter: Filter = { ...filter, value };
    onValueChange(newFilter);
  };

  switch (filter.type) {
    case "radio":
      return (
        <div>
          <Label htmlFor={filter.id}>{filter.displayName}</Label>
          <RadioGroup
            id={filter.id}
            value={filter.value}
            name={filter.id}
            onValueChange={onChange}
            className="flex"
          >
            {filter.options?.map((o) => (
              <div key={o.value} className="flex items-center gap-1">
                <RadioGroupItem value={o.value} id={o.value} />
                <Label htmlFor={o.value}>{o.displayName}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    case "select":
      return (
        <div>
          <Label htmlFor={filter.id}>{filter.displayName}</Label>
          <Select value={filter.value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={filter.displayName} />
            </SelectTrigger>
            <SelectContent id={filter.id}>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "text":
      return (
        <div>
          <Label htmlFor={filter.id}>{filter.displayName}</Label>
          <Input onChange={onInputChange} value={filter.value} />
        </div>
      );
    default:
      return <></>;
  }
};

export default FilterComponent;
