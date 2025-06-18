import Chart from 'chart.js/auto';

class Stats {
  constructor() {
    this.charts = {};
  }

  calculateWeeklyAverages(entries) {
    const weeklyData = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          ph: [],
          ec: [],
          moods: [],
          waterings: 0
        };
      }
      
      if (entry.ph) weeklyData[weekKey].ph.push(parseFloat(entry.ph));
      if (entry.ec) weeklyData[weekKey].ec.push(parseFloat(entry.ec));
      if (entry.mood) weeklyData[weekKey].moods.push(entry.mood);
      if (entry.didWater) weeklyData[weekKey].waterings++;
    });

    return Object.entries(weeklyData).map(([week, data]) => ({
      week,
      avgPh: data.ph.length ? data.ph.reduce((a, b) => a + b, 0) / data.ph.length : null,
      avgEc: data.ec.length ? data.ec.reduce((a, b) => a + b, 0) / data.ec.length : null,
      avgMood: data.moods.length ? data.moods.reduce((a, b) => a + b, 0) / data.moods.length : null,
      waterings: data.waterings
    }));
  }

  renderEmotionTimeline(entries, containerId) {
    const ctx = document.getElementById(containerId);
    if (!ctx) return;

    const data = entries.map(e => ({
      x: new Date(e.date),
      y: e.mood
    })).sort((a, b) => a.x - b.x);

    if (this.charts.emotionTimeline) {
      this.charts.emotionTimeline.destroy();
    }

    this.charts.emotionTimeline = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Estado de Ánimo',
          data: data,
          borderColor: '#4ade80',
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          },
          y: {
            min: 1,
            max: 4,
            ticks: {
              stepSize: 1,
              callback: value => {
                const moods = ['😞', '⚠️', '🌿', '🌞'];
                return moods[value - 1] || value;
              }
            }
          }
        }
      }
    });
  }

  renderEcPhChart(entries, containerId) {
    const ctx = document.getElementById(containerId);
    if (!ctx) return;

    const weeklyData = this.calculateWeeklyAverages(entries);
    const labels = weeklyData.map(d => d.week);
    const phData = weeklyData.map(d => d.avgPh);
    const ecData = weeklyData.map(d => d.avgEc);

    if (this.charts.ecPh) {
      this.charts.ecPh.destroy();
    }

    this.charts.ecPh = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'pH',
            data: phData,
            borderColor: '#0ea5e9',
            tension: 0.4,
            fill: false
          },
          {
            label: 'EC',
            data: ecData,
            borderColor: '#f87171',
            tension: 0.4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  renderWateringFrequency(entries, containerId) {
    const ctx = document.getElementById(containerId);
    if (!ctx) return;

    const weeklyData = this.calculateWeeklyAverages(entries);
    const labels = weeklyData.map(d => d.week);
    const waterings = weeklyData.map(d => d.waterings);

    if (this.charts.watering) {
      this.charts.watering.destroy();
    }

    this.charts.watering = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Riegos por Semana',
          data: waterings,
          backgroundColor: '#60a5fa',
          borderColor: '#3b82f6',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
}

export const stats = new Stats(); 