import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, BarElement, Title, Tooltip, Legend, Filler);

function useIsDark() {
    const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'nuit');
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setDark(document.documentElement.getAttribute('data-theme') === 'nuit');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);
    return dark;
}

function buildOptions(isDark) {
    const tickColor = isDark ? '#a8a29e' : '#a8a29e';
    const gridColor = isDark ? '#292524' : '#f1f0ef';
    const legendColor = isDark ? '#d6d3d1' : '#78716c';
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 7,
                    boxHeight: 7,
                    padding: 20,
                    font: { size: 12, weight: '500' },
                    color: legendColor,
                },
            },
            tooltip: {
                backgroundColor: isDark ? '#f5f5f4' : '#1c1917',
                titleColor: isDark ? '#1c1917' : '#f5f5f4',
                bodyColor: isDark ? '#44403c' : '#d6d3d1',
                titleFont: { size: 13, weight: '600' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 10,
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
                usePointStyle: true,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { font: { size: 11 }, color: tickColor, maxRotation: 0, padding: 8 },
            },
            y: {
                beginAtZero: true,
                grid: { color: gridColor, drawBorder: false },
                border: { display: false },
                ticks: { font: { size: 11 }, color: tickColor, precision: 0, padding: 8 },
            },
        },
    };
}

const tealPalette = {
    bg: 'rgba(20, 184, 166, 0.14)',
    border: 'rgba(20, 184, 166, 1)',
    blue: 'rgba(59, 130, 246, 1)',
    purple: 'rgba(168, 85, 247, 1)',
};

export function TrendChart({ data, height = 220 }) {
    const isDark = useIsDark();
    const labels = data.map((d) => d.label);
    const datasets = [
        {
            label: 'Visiteurs uniques',
            data: data.map((d) => d.unique_visitors),
            borderColor: tealPalette.blue,
            backgroundColor: 'rgba(59, 130, 246, 0.10)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: tealPalette.blue,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            borderWidth: 2.5,
        },
        {
            label: 'Pages vues',
            data: data.map((d) => d.pages_vues),
            borderColor: tealPalette.border,
            backgroundColor: tealPalette.bg,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: tealPalette.border,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            borderWidth: 2.5,
        },
        {
            label: 'Utilisateurs',
            data: data.map((d) => d.users_total),
            borderColor: tealPalette.purple,
            backgroundColor: 'rgba(168, 85, 247, 0.10)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: tealPalette.purple,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            borderWidth: 2.5,
        },
    ];

    return (
        <div style={{ height }}>
            <Line data={{ labels, datasets }} options={buildOptions(isDark)} />
        </div>
    );
}

export function SignupChart({ data, height = 220 }) {
    const isDark = useIsDark();
    const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const labels = data.map((d) => dayLabels[d.day] || `J${d.day}`);
    const values = data.map((d) => d.count);

    return (
        <div style={{ height }}>
            <Bar
                data={{
                    labels,
                    datasets: [
                        {
                            label: 'Inscriptions',
                            data: values,
                            backgroundColor: values.map((v) =>
                                v > 0 ? 'rgba(20, 184, 166, 0.85)' : isDark ? 'rgba(68, 64, 60, 0.5)' : 'rgba(231, 229, 228, 0.5)'
                            ),
                            hoverBackgroundColor: 'rgba(20, 184, 166, 1)',
                            borderRadius: 8,
                            borderSkipped: false,
                            maxBarThickness: 32,
                        },
                    ],
                }}
                options={buildOptions(isDark)}
            />
        </div>
    );
}

export function MiniBarChart({ data, height = 160 }) {
    const isDark = useIsDark();
    const labels = data.map((d) => d.label);
    const values = data.map((d) => d.value);

    return (
        <div style={{ height }}>
            <Bar
                data={{
                    labels,
                    datasets: [
                        {
                            data: values,
                            backgroundColor: 'rgba(20, 184, 166, 0.85)',
                            hoverBackgroundColor: 'rgba(20, 184, 166, 1)',
                            borderRadius: 8,
                            borderSkipped: false,
                            maxBarThickness: 32,
                        },
                    ],
                }}
                options={buildOptions(isDark)}
            />
        </div>
    );
}
