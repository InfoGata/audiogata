import { MdPlayCircle } from "react-icons/md";
import { Button } from "./ui/button";

type PlayButtonProps = {
  onClick: () => void;
};

const PlayButton: React.FC<PlayButtonProps> = (props) => {
  const { onClick } = props;
  return (
    <Button variant="ghost" size="icon" className="w-16 h-16" onClick={onClick}>
      <MdPlayCircle className="!w-14 !h-14" />
    </Button>
  );
};

export default PlayButton;
