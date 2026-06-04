'use client';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

interface EChartProps {
  option: EChartsOption;
  theme?: 'light' | 'dark';
  height?: string;
  width?: string;
  onClick?: (params: unknown) => void;
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
  const onClickRef = useRef(onClick);

  onClickRef.current = onClick;

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, theme);
    }

    chartInstance.current.setOption(option, { notMerge: true, lazyUpdate: false });

    const handleClick = (params: unknown) => {
      onClickRef.current?.(params);
    };

    chartInstance.current.off('click');
    if (onClickRef.current) {
      chartInstance.current.on('click', handleClick);
    }

    const resizeObserver = new ResizeObserver(() => {
      chartInstance.current?.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [option, theme]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return <div ref={chartRef} style={{ width, height }} />;
};

export default EChart;
