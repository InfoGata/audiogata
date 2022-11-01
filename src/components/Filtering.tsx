import { ExpandMore } from "@mui/icons-material";
import { Box, Button, Collapse, Grid } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Filter, FilterInfo } from "../plugintypes";
import FilterComponent from "./FilterComponent";

interface FilteringProps {
  filters: FilterInfo;
  setFilters: (filters: FilterInfo) => void;
}

const Filtering: React.FC<FilteringProps> = (props) => {
  const { filters, setFilters } = props;
  const [newFilters, setNewFilters] = React.useState(filters.filters);
  const [showFilter, setShowFilter] = React.useState(false);
  const { t } = useTranslation();

  const onValueChange = (filter?: Filter) => {
    setNewFilters(
      newFilters.map((f) =>
        f.id === filter?.id ? { ...f, value: filter.value } : f
      )
    );
  };

  const onApplyFilters = () => {
    setFilters({ filters: newFilters });
  };

  const onToggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const filterComponents = newFilters.map((f) => (
    <Grid key={f.id} item xs={2} sm={4} md={4}>
      <FilterComponent filter={f} onValueChange={onValueChange} />
    </Grid>
  ));
  return (
    <Box sx={{ "& button": { m: 2 } }}>
      <Grid>
        <Button
          variant="outlined"
          onClick={onToggleFilter}
          endIcon={<ExpandMore />}
        >
          {t("filters")}
        </Button>
      </Grid>
      <Collapse in={showFilter}>
        <Grid container spacing={4} columns={{ xs: 4, sm: 8, md: 12 }}>
          {filterComponents}
        </Grid>
        <Button variant="contained" onClick={onApplyFilters}>
          {t("applyFilters")}
        </Button>
      </Collapse>
    </Box>
  );
};

export default Filtering;
