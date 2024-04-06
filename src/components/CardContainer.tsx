import React from "react";

const CardContainer: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <div className="grid grid-cols-1 gap-5 mt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {props.children}
    </div>
  );
};

export default CardContainer;
