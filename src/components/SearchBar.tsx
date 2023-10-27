import { Search } from "@mui/icons-material";
import { Autocomplete, InputAdornment, TextField } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const SearchBarComponent = styled(Autocomplete)(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "300px",
  "& .MuiOutlinedInput-root": {
    padding: theme.spacing(0, 0, 0, 0),
    paddingLeft: `1em`,
  },
}));

const SearchBar: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = (event: React.FormEvent<{}>) => {
    navigate(`/search?q=${search}`);
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <SearchBarComponent
        freeSolo
        onInputChange={(_event, newInputValue) => {
          setSearch(newInputValue);
        }}
        renderInput={(params) => {
          const { InputProps, ...rest } = params;
          return (
            <TextField
              placeholder={t("search")}
              {...rest}
              InputProps={{
                ...InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          );
        }}
        options={[]}
      />
    </form>
  );
};
export default SearchBar;
