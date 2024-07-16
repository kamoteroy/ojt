import React from "react";

const SamplePrint = React.forwardRef((props, ref) => {
  return (
    <div ref={ref}>
      {/* Content you want to print */}
      <h1>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ratione dolore
        ipsam sed hic unde, incidunt minus eum nostrum eveniet accusantium
        cupiditate vero ex officia. Omnis quis debitis accusamus fugit repellat!
      </h1>
    </div>
  );
});

export default SamplePrint;
