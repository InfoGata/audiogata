import React from "react";
import { useTranslation } from "react-i18next";
import { Filter, FilterInfo } from "../plugintypes";
import FilterComponent from "./FilterComponent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";

interface FilteringProps {
  filters: FilterInfo;
  setFilters: (filters: FilterInfo) => void;
}

const Filtering: React.FC<FilteringProps> = (props) => {
  const { filters, setFilters } = props;
  const [newFilters, setNewFilters] = React.useState(filters.filters);
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

  const filterComponents = newFilters.map((f) => (
    <FilterComponent key={f.id} filter={f} onValueChange={onValueChange} />
  ));

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>{t("filters")}</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
            {filterComponents}
          </div>
          <Button onClick={onApplyFilters}>{t("applyFilters")}</Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default Filtering;
