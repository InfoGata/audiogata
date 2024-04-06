import ArtistLink from "./ArtistLInk";
import { Fragment } from "react";
import { MultipleArtistItem } from "@/types";

type Props = {
  item: MultipleArtistItem;
};

const ArtistLinks: React.FC<Props> = (props) => {
  const { item } = props;
  return (
    <>
      <ArtistLink
        pluginId={item.pluginId}
        name={item.artistName}
        apiId={item.artistApiId}
      />
      {item.addtionalArtists &&
        item.addtionalArtists.map((a, i) => (
          <Fragment key={i}>
            {", "}
            <ArtistLink
              pluginId={item.pluginId}
              name={a.name}
              apiId={a.apiId}
            />
          </Fragment>
        ))}
    </>
  );
};

export default ArtistLinks;
