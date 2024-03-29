import { Link } from "react-router-dom";

interface ArtistLinkProps {
  pluginId?: string;
  name?: string;
  apiId?: string;
}

const ArtistLink: React.FC<ArtistLinkProps> = (props) => {
  const { pluginId, name, apiId } = props;
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  return (
    <Link
      to={`/plugins/${pluginId}/artists/${apiId}`}
      onClick={stopPropagation}
    >
      {name}
    </Link>
  );
};

export default ArtistLink;
