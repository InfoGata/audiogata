import React from "react";

type TitleProps = {
  title?: string;
};

const Title: React.FC<TitleProps> = (props) => {
  const { title } = props;
  return <h2 className="text-4xl font-bold">{title}</h2>;
};

export default Title;
