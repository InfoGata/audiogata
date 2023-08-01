import {
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import React from "react";
import { Filter } from "../plugintypes";

interface FilterComponentProps {
  filter: Filter;
  onValueChange: (filter?: Filter) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = (props) => {
  const { filter, onValueChange } = props;

  const onSelectChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    const newFilter: Filter = { ...filter, value };
    onValueChange(newFilter);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const newFilter: Filter = { ...filter, value };
    onValueChange(newFilter);
  };

  switch (filter.type) {
    case "radio":
      return (
        <FormControl>
          <FormLabel id={filter.id}>{filter.displayName}</FormLabel>
          <RadioGroup
            row
            aria-labelledby={filter.id}
            value={filter.value}
            name={filter.id}
            onChange={onChange}
          >
            {filter.options?.map((o) => (
              <FormControlLabel
                key={o.value}
                value={o.value}
                control={<Radio />}
                label={o.displayName}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );
    case "select":
      return (
        <FormControl fullWidth>
          <InputLabel id={filter.id}>{filter.displayName}</InputLabel>
          <Select
            labelId={filter.id}
            value={filter.value}
            label={filter.displayName}
            onChange={onSelectChange}
          >
            {filter.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case "text":
      return (
        <TextField
          required
          onChange={onChange}
          label={filter.displayName}
          value={filter.value}
        />
      );
    default:
      const _exhaustive: never = filter.type;
      return <></>;
  }
};

export default FilterComponent;
