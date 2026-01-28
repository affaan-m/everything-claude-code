---
name: quant-research
description: Quantitative finance research and strategy development. Includes backtesting, data analysis, and trading system patterns for Linux cloud environments.
metadata: {"clawdbot":{"emoji":"📈","os":["darwin","linux"],"requires":{"bins":["python3"]}}}
---

# Quantitative Research

Tools and patterns for quantitative finance research on Linux cloud hosts.

## Prerequisites

```bash
# Install Python quant stack
pip install pandas numpy scipy matplotlib yfinance
pip install backtrader zipline-reloaded vectorbt
pip install qlib  # Microsoft's AI quant platform

# Optional: For ML-based strategies
pip install scikit-learn xgboost lightgbm tensorflow
pip install finrl  # Reinforcement learning for finance
```

## Quick Start

### 1. Fetch Market Data

```python
import yfinance as yf
import pandas as pd

# Download stock data
data = yf.download("AAPL", start="2020-01-01", end="2024-01-01")
print(data.head())

# Multiple symbols
symbols = ["AAPL", "GOOGL", "MSFT", "AMZN"]
data = yf.download(symbols, start="2020-01-01")
```

### 2. Basic Technical Indicators

```python
import pandas as pd
import numpy as np

def add_indicators(df):
    # Moving averages
    df['SMA_20'] = df['Close'].rolling(window=20).mean()
    df['SMA_50'] = df['Close'].rolling(window=50).mean()
    df['EMA_12'] = df['Close'].ewm(span=12).mean()
    
    # RSI
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # Bollinger Bands
    df['BB_middle'] = df['Close'].rolling(window=20).mean()
    df['BB_std'] = df['Close'].rolling(window=20).std()
    df['BB_upper'] = df['BB_middle'] + 2 * df['BB_std']
    df['BB_lower'] = df['BB_middle'] - 2 * df['BB_std']
    
    # MACD
    df['EMA_12'] = df['Close'].ewm(span=12).mean()
    df['EMA_26'] = df['Close'].ewm(span=26).mean()
    df['MACD'] = df['EMA_12'] - df['EMA_26']
    df['MACD_signal'] = df['MACD'].ewm(span=9).mean()
    
    return df
```

## Backtesting with VectorBT

VectorBT is the fastest Python backtesting library (vectorized operations).

```python
import vectorbt as vbt
import numpy as np

# Download data
price = vbt.YFData.download("AAPL", start="2020-01-01").get("Close")

# Simple moving average crossover
fast_ma = vbt.MA.run(price, window=10)
slow_ma = vbt.MA.run(price, window=50)

# Generate signals
entries = fast_ma.ma_crossed_above(slow_ma)
exits = fast_ma.ma_crossed_below(slow_ma)

# Run backtest
portfolio = vbt.Portfolio.from_signals(
    price,
    entries=entries,
    exits=exits,
    init_cash=10000,
    fees=0.001  # 0.1% fees
)

# Results
print(f"Total Return: {portfolio.total_return():.2%}")
print(f"Sharpe Ratio: {portfolio.sharpe_ratio():.2f}")
print(f"Max Drawdown: {portfolio.max_drawdown():.2%}")

# Visualization
portfolio.plot().show()
```

## Strategy Development Pattern

### 1. Research Phase

```python
# research/strategy_research.py

class StrategyResearch:
    def __init__(self, symbol, start_date, end_date):
        self.symbol = symbol
        self.data = self.load_data(start_date, end_date)
        
    def load_data(self, start, end):
        return yf.download(self.symbol, start=start, end=end)
    
    def add_features(self):
        """Add technical indicators and features"""
        self.data = add_indicators(self.data)
        return self
    
    def explore(self):
        """Exploratory data analysis"""
        print("=== Data Summary ===")
        print(self.data.describe())
        print("\n=== Correlation Matrix ===")
        print(self.data.corr())
        
    def plot_signals(self, entry_col, exit_col):
        """Visualize entry/exit signals"""
        import matplotlib.pyplot as plt
        
        fig, ax = plt.subplots(figsize=(14, 7))
        ax.plot(self.data.index, self.data['Close'], label='Price')
        ax.scatter(
            self.data[self.data[entry_col]].index,
            self.data[self.data[entry_col]]['Close'],
            marker='^', color='g', label='Buy'
        )
        ax.scatter(
            self.data[self.data[exit_col]].index,
            self.data[self.data[exit_col]]['Close'],
            marker='v', color='r', label='Sell'
        )
        ax.legend()
        plt.savefig('/tmp/signals.png')
        print("Plot saved to /tmp/signals.png")
```

### 2. Backtest Phase

```python
# backtest/strategy_backtest.py

class StrategyBacktest:
    def __init__(self, data, initial_capital=10000):
        self.data = data
        self.initial_capital = initial_capital
        
    def run(self, entry_signal, exit_signal):
        """Run backtest with given signals"""
        positions = []
        cash = self.initial_capital
        shares = 0
        
        for i, row in self.data.iterrows():
            if entry_signal.loc[i] and cash > 0:
                shares = cash / row['Close']
                cash = 0
            elif exit_signal.loc[i] and shares > 0:
                cash = shares * row['Close']
                shares = 0
            positions.append(cash + shares * row['Close'])
        
        self.data['Portfolio'] = positions
        return self
    
    def metrics(self):
        """Calculate performance metrics"""
        returns = self.data['Portfolio'].pct_change().dropna()
        
        return {
            'total_return': (self.data['Portfolio'].iloc[-1] / self.initial_capital - 1),
            'sharpe_ratio': returns.mean() / returns.std() * np.sqrt(252),
            'max_drawdown': (self.data['Portfolio'] / self.data['Portfolio'].cummax() - 1).min(),
            'win_rate': (returns > 0).sum() / len(returns),
            'avg_trade': returns.mean()
        }
```

### 3. Optimization Phase

```python
# optimize/parameter_sweep.py

def parameter_sweep(data, fast_range, slow_range):
    """Grid search for optimal parameters"""
    results = []
    
    for fast in fast_range:
        for slow in slow_range:
            if fast >= slow:
                continue
                
            # Generate signals
            fast_ma = data['Close'].rolling(fast).mean()
            slow_ma = data['Close'].rolling(slow).mean()
            entry = (fast_ma > slow_ma) & (fast_ma.shift(1) <= slow_ma.shift(1))
            exit = (fast_ma < slow_ma) & (fast_ma.shift(1) >= slow_ma.shift(1))
            
            # Backtest
            bt = StrategyBacktest(data.copy())
            bt.run(entry, exit)
            metrics = bt.metrics()
            
            results.append({
                'fast': fast,
                'slow': slow,
                **metrics
            })
    
    return pd.DataFrame(results).sort_values('sharpe_ratio', ascending=False)
```

## Microsoft Qlib (AI-Oriented)

Qlib is Microsoft's AI quant platform for production-grade research.

```bash
# Install
pip install pyqlib

# Initialize (downloads China A-share data by default)
qlib init
```

```python
import qlib
from qlib.config import REG_CN

# Initialize with China data
qlib.init(provider_uri="~/.qlib/qlib_data/cn_data", region=REG_CN)

# Create dataset
from qlib.data.dataset import DatasetH
from qlib.data.dataset.handler import DataHandlerLP

# Define data handler
handler_config = {
    "start_time": "2015-01-01",
    "end_time": "2022-12-31",
    "instruments": "csi300",  # CSI 300 index
}

# ML model for stock prediction
from qlib.contrib.model.gbdt import LGBModel

model = LGBModel(
    loss="mse",
    num_leaves=128,
    learning_rate=0.05,
    n_estimators=1000
)
```

## FinRL (Reinforcement Learning)

```python
from finrl.meta.preprocessor.preprocessors import FeatureEngineer
from finrl.meta.env_stock_trading.env_stocktrading import StockTradingEnv
from finrl.agents.stablebaselines3.models import DRLAgent

# Prepare data
fe = FeatureEngineer(
    use_technical_indicator=True,
    use_turbulence=True,
    user_defined_feature=False
)

# Create environment
env = StockTradingEnv(
    df=processed_data,
    stock_dim=len(tickers),
    hmax=100,
    initial_amount=1000000,
    transaction_cost_pct=0.001
)

# Train agent
agent = DRLAgent(env=env)
model = agent.get_model("ppo")
trained_model = agent.train_model(model=model, total_timesteps=100000)
```

## Common Strategies

### Mean Reversion

```python
def mean_reversion_signals(data, window=20, threshold=2):
    """Generate mean reversion signals using Bollinger Bands"""
    middle = data['Close'].rolling(window).mean()
    std = data['Close'].rolling(window).std()
    upper = middle + threshold * std
    lower = middle - threshold * std
    
    entry = data['Close'] < lower  # Buy when price below lower band
    exit = data['Close'] > middle  # Sell when price returns to mean
    
    return entry, exit
```

### Momentum

```python
def momentum_signals(data, lookback=20):
    """Generate momentum signals"""
    returns = data['Close'].pct_change(lookback)
    
    entry = returns > returns.rolling(252).quantile(0.8)  # Top 20% momentum
    exit = returns < returns.rolling(252).quantile(0.5)   # Below median
    
    return entry, exit
```

### Pairs Trading

```python
def pairs_trading_signals(stock1, stock2, window=20, threshold=2):
    """Generate pairs trading signals"""
    spread = stock1['Close'] - stock2['Close']
    zscore = (spread - spread.rolling(window).mean()) / spread.rolling(window).std()
    
    long_entry = zscore < -threshold   # Spread too low
    short_entry = zscore > threshold   # Spread too high
    exit = abs(zscore) < 0.5           # Mean reversion
    
    return long_entry, short_entry, exit
```

## Risk Management

```python
def calculate_position_size(capital, risk_pct, entry_price, stop_loss):
    """Kelly criterion-inspired position sizing"""
    risk_amount = capital * risk_pct
    risk_per_share = abs(entry_price - stop_loss)
    shares = risk_amount / risk_per_share
    return int(shares)

def calculate_var(returns, confidence=0.95):
    """Value at Risk calculation"""
    return np.percentile(returns, (1 - confidence) * 100)

def calculate_cvar(returns, confidence=0.95):
    """Conditional Value at Risk (Expected Shortfall)"""
    var = calculate_var(returns, confidence)
    return returns[returns <= var].mean()
```

## Best Practices

### 1. Walk-Forward Analysis
Never test on data you trained on. Use walk-forward or expanding window.

### 2. Transaction Costs
Always include realistic transaction costs (0.1% minimum).

### 3. Slippage
Account for market impact on large orders.

### 4. Survivorship Bias
Use point-in-time data, not current constituents.

### 5. Look-Ahead Bias
Never use future data in calculations.

### 6. Multiple Testing Correction
Adjust p-values for multiple strategy tests (Bonferroni, FDR).

---

**Remember**: Past performance does not predict future results. Always paper trade before live deployment.

Based on: [Qlib](https://github.com/microsoft/qlib), [FinRL](https://github.com/AI4Finance-Foundation/FinRL), [VectorBT](https://github.com/polakowo/vectorbt)
