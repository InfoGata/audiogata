import { MdPlayCircle } from "react-icons/md";
import { Button } from "./ui/button";

type PlayButtonProps = {
  onClick: () => void;
};

const PlayButton: React.FC<PlayButtonProps> = (props) => {
  const { onClick } = props;
  return (
    <Button variant="ghost" size="icon" className="size-16" onClick={onClick}>
      <MdPlayCircle className="!size-14" />
    </Button>
  );
};

export default PlayButton;
