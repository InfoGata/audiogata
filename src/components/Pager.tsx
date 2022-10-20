import { Button, Grid } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface PagerProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const Pager: React.FC<PagerProps> = (props) => {
  const { hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } = props;
  const { t } = useTranslation();
  return (
    <Grid>
      {hasPreviousPage && (
        <Button onClick={onPreviousPage}>{t("previousPage")}</Button>
      )}
      {hasNextPage && <Button onClick={onNextPage}>{t("nextPage")}</Button>}
    </Grid>
  );
};

export default Pager;
