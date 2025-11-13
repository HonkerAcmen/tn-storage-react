'use client';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

interface EChartProps {
  option: EChartsOption; // 图表配置
  theme?: 'light' | 'dark'; // 主题
  height?: string; // 高度
  width?: string; // 宽度
  onClick?: (params: unknown) => void; // 点击事件
}

const EChart: React.FC<EChartProps> = ({
  option,
  theme = 'light',
  height = '400px',
  width = '100%',
  onClick,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化
    chartInstance.current = echarts.init(chartRef.current, theme);

    // 设置配置项
    chartInstance.current.setOption(option);

    // 绑定事件
    if (onClick) {
      chartInstance.current.on('click', onClick);
    }

    // 监听窗口变化，图表自适应
    const resizeObserver = new ResizeObserver(() => {
      chartInstance.current?.resize();
    });
    resizeObserver.observe(chartRef.current);

    // 销毁
    return () => {
      chartInstance.current?.dispose();
      resizeObserver.disconnect();
    };
  }, [option, theme, onClick]);

  return <div ref={chartRef} style={{ width, height }} />;
};

export default EChart;

/**
 'use client';
import React, { useEffect, useState } from 'react';
import EChart from '@/components/EChart';

export default function Page() {
  const [data, setData] = useState<number[]>([10, 22, 36, 45, 30, 50, 70]);

  // 模拟数据变化（每 2 秒更新一次）
  useEffect(() => {
    const timer = setInterval(() => {
      setData((prev) =>
        prev.map(() => Math.floor(Math.random() * 100))
      );
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const option = {
    title: {
      text: '📈 动态折线图',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        data,
        areaStyle: {
          opacity: 0.2,
        },
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">ECharts 通用组件示例</h1>

      <EChart
        option={option}
        height="400px"
        onClick={(params) => {
          alert(`你点击了：${params.name}, 值为 ${params.value}`);
        }}
      />
    </div>
  );
}

 */
