// Simple price chart implementation for DikiSwap
class PriceChart {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas with id ${canvasId} not found`);
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.data = options.data || this.generateMockData();
    this.options = {
      lineColor: options.lineColor || '#00c853',
      fillColor: options.fillColor || 'rgba(0, 200, 83, 0.1)',
      gridColor: options.gridColor || 'rgba(105, 240, 174, 0.1)',
      textColor: options.textColor || 'rgba(165, 214, 167, 0.8)',
      padding: options.padding || 20,
      showGrid: options.showGrid !== undefined ? options.showGrid : true,
      showLabels: options.showLabels !== undefined ? options.showLabels : true,
      ...options,
    };

    // Set canvas size
    this.resize();

    // Initial draw
    this.draw();

    // Add resize listener
    window.addEventListener('resize', () => {
      this.resize();
      this.draw();
    });
  }

  // Generate mock price data
  generateMockData(days = 30) {
    const data = [];
    let price = 1800 + Math.random() * 200;

    for (let i = 0; i < days; i++) {
      // Random price movement with some trend
      const change = (Math.random() - 0.5) * 50;
      price += change;
      price = Math.max(price, 1500); // Ensure price doesn't go too low

      data.push({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
        price: price,
      });
    }

    return data;
  }

  // Update chart data
  updateData(newData) {
    this.data = newData;
    this.draw();
  }

  // Resize canvas to fit container
  resize() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }

  // Draw the chart
  draw() {
    const { ctx, data, options, canvas } = this;
    const { width, height } = canvas;
    const { padding, lineColor, fillColor, gridColor, textColor, showGrid, showLabels } = options;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) return;

    // Calculate min and max values
    const prices = data.map((d) => d.price);
    const minPrice = Math.min(...prices) * 0.95;
    const maxPrice = Math.max(...prices) * 1.05;
    const priceRange = maxPrice - minPrice;

    // Draw grid
    if (showGrid) {
      this.drawGrid(minPrice, maxPrice, priceRange);
    }

    // Draw price line and fill
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Line style
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill area under the line
    ctx.lineTo(padding + (width - 2 * padding), height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Draw labels
    if (showLabels) {
      this.drawLabels(minPrice, maxPrice);
    }
  }

  // Draw grid lines
  drawGrid(minPrice, maxPrice, priceRange) {
    const { ctx, canvas, options } = this;
    const { width, height } = canvas;
    const { padding, gridColor } = options;

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Horizontal grid lines (5 lines)
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * (height - 2 * padding);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines (6 lines for months)
    for (let i = 0; i <= 5; i++) {
      const x = padding + (i / 5) * (width - 2 * padding);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
  }

  // Draw price and date labels
  drawLabels(minPrice, maxPrice) {
    const { ctx, data, canvas, options } = this;
    const { width, height } = canvas;
    const { padding, textColor } = options;

    ctx.fillStyle = textColor;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    // Price labels (left side)
    for (let i = 0; i <= 4; i++) {
      const price = maxPrice - (i / 4) * (maxPrice - minPrice);
      const y = padding + (i / 4) * (height - 2 * padding);
      ctx.fillText('$' + price.toFixed(2), 5, y + 4);
    }

    // Date labels (bottom)
    const dateIndices = [0, Math.floor(data.length / 2), data.length - 1];
    dateIndices.forEach((i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const date = data[i].date;
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      ctx.textAlign = i === 0 ? 'left' : i === data.length - 1 ? 'right' : 'center';
      ctx.fillText(dateStr, x, height - 5);
    });
  }
}
