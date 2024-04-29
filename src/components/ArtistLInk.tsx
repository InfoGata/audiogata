import { Link } from "@tanstack/react-router";

interface ArtistLinkProps {
  pluginId?: string;
  name?: string;
  apiId?: string;
}

const ArtistLink: React.FC<ArtistLinkProps> = (props) => {
  const { pluginId, name, apiId } = props;
  const stopPropagation = (e: React.MouseEvent<"a">) => {
    e.stopPropagation();
  };
  return (
    <Link
      to="/plugins/$pluginId/artists/$apiId"
      params={{ pluginId: pluginId || "", apiId: apiId || "" }}
      onClick={stopPropagation}
    >
      {name}
    </Link>
  );
};

export default ArtistLink;
