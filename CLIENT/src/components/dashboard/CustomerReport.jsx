import React, { useState, useEffect } from "react";
import axiosInstance from "../shared/axiosInstance";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from "@nextui-org/react";
import { PieChart, Pie, ResponsiveContainer, Sector } from "recharts";
import StarIcon from "../../icons/StarIcon";
import Loading from "../shared/Loading";

const CustomerReport = () => {
  const [records, setRecords] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [averageRate, setAverageRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const response = await axiosInstance.get(`/getAvgCount/TicketReview`);
      // console.log("response: ", response.data);
      setRecords(response.data);
      setAverageRate(response.data.averageRate);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return null;
  }

  const data = [
    { name: "Positive ", value: averageRate },
    { name: "Negative", value: 10 - averageRate },
  ];

  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={"#000"}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={"#6ABD99"}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={"#6ABD99"}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
        >
          {`${value.toFixed(2)} Ratings`}
          <StarIcon />
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
        >
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="col-span-5">
      <div className="py-10">
        <p className="text-4xl font-bold">Feedback</p>
        <Divider />
      </div>
      <Card className="w-full">
        <CardHeader className="flex gap-3 flex-row justify-between">
          <div className="flex flex-col md:flex-row">
            <p className="text-md font-bold uppercase">CSAT Report</p>
          </div>
          <div className="flex flex-row">
            <StarIcon />
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="h-fit w-full">
          <div className="flex flex-row justify-center">
            <PieChart width={450} height={300}>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                fill="#dd7373"
                dataKey="value"
                onMouseEnter={onPieEnter}
              />
            </PieChart>
          </div>
          <Divider />
          <div className="flex flex-row justify-center items-center gap-2">
            <span className="font-bold text-xl">{records.totalRecords}</span>
            <span> Total Reviews</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CustomerReport;
