import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_squared_error, mean_absolute_error
from typing import Dict, List, Any, Tuple
import json
from datetime import datetime, timedelta


class ForecastService:
    """Service for generating predictions using various ML models"""
    
    def __init__(self):
        self.models = {
            "linear_regression": self._linear_regression_forecast,
            "arima": self._arima_forecast,
            "moving_average": self._moving_average_forecast
        }
    
    def generate_forecast(
        self, 
        data: List[Dict[str, Any]], 
        target_column: str, 
        model_type: str = "arima",
        forecast_periods: int = 30
    ) -> Dict[str, Any]:
        """Generate forecast for given data"""
        try:
            df = pd.DataFrame(data)
            
            if target_column not in df.columns:
                raise ValueError(f"Target column '{target_column}' not found in data")
            
            # Prepare time series data
            if 'timestamp' in df.columns:
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                df = df.sort_values('timestamp')
                df.set_index('timestamp', inplace=True)
            
            target_series = df[target_column].dropna()
            
            if len(target_series) < 10:
                raise ValueError("Insufficient data points for forecasting (minimum 10 required)")
            
            # Generate forecast using selected model
            if model_type not in self.models:
                model_type = "arima"  # Default fallback
            
            forecast_result = self.models[model_type](target_series, forecast_periods)
            
            return {
                "model_type": model_type,
                "target_column": target_column,
                "forecast_data": forecast_result["predictions"],
                "confidence_interval": forecast_result.get("confidence_interval"),
                "accuracy_metrics": forecast_result.get("accuracy_metrics"),
                "forecast_dates": forecast_result.get("forecast_dates")
            }
            
        except Exception as e:
            raise Exception(f"Forecast generation failed: {str(e)}")
    
    def _arima_forecast(self, series: pd.Series, periods: int) -> Dict[str, Any]:
        """ARIMA model forecasting"""
        try:
            # Auto-detect ARIMA parameters (simplified)
            model = ARIMA(series, order=(1, 1, 1))
            fitted_model = model.fit()
            
            # Generate forecast
            forecast = fitted_model.forecast(steps=periods)
            conf_int = fitted_model.get_forecast(steps=periods).conf_int()
            
            # Generate future dates
            last_date = series.index[-1] if hasattr(series.index, 'dtype') else datetime.now()
            if isinstance(last_date, str):
                last_date = pd.to_datetime(last_date)
            
            future_dates = pd.date_range(
                start=last_date + timedelta(days=1),
                periods=periods,
                freq='D'
            )
            
            # Calculate accuracy on training data
            fitted_values = fitted_model.fittedvalues
            rmse = np.sqrt(mean_squared_error(series[1:], fitted_values))
            mae = mean_absolute_error(series[1:], fitted_values)
            
            return {
                "predictions": forecast.tolist(),
                "confidence_interval": {
                    "lower": conf_int.iloc[:, 0].tolist(),
                    "upper": conf_int.iloc[:, 1].tolist()
                },
                "accuracy_metrics": {
                    "rmse": rmse,
                    "mae": mae,
                    "aic": fitted_model.aic
                },
                "forecast_dates": future_dates.strftime('%Y-%m-%d').tolist()
            }
            
        except Exception as e:
            # Fallback to linear regression if ARIMA fails
            return self._linear_regression_forecast(series, periods)
    
    def _linear_regression_forecast(self, series: pd.Series, periods: int) -> Dict[str, Any]:
        """Linear regression forecasting"""
        try:
            # Prepare data
            X = np.arange(len(series)).reshape(-1, 1)
            y = series.values
            
            # Fit model
            model = LinearRegression()
            model.fit(X, y)
            
            # Generate forecast
            future_X = np.arange(len(series), len(series) + periods).reshape(-1, 1)
            predictions = model.predict(future_X)
            
            # Calculate confidence interval (simplified)
            residuals = y - model.predict(X)
            std_error = np.std(residuals)
            confidence_interval = {
                "lower": (predictions - 1.96 * std_error).tolist(),
                "upper": (predictions + 1.96 * std_error).tolist()
            }
            
            # Generate future dates
            last_date = series.index[-1] if hasattr(series.index, 'dtype') else datetime.now()
            if isinstance(last_date, str):
                last_date = pd.to_datetime(last_date)
            
            future_dates = pd.date_range(
                start=last_date + timedelta(days=1),
                periods=periods,
                freq='D'
            )
            
            # Calculate accuracy metrics
            y_pred = model.predict(X)
            rmse = np.sqrt(mean_squared_error(y, y_pred))
            mae = mean_absolute_error(y, y_pred)
            r2 = model.score(X, y)
            
            return {
                "predictions": predictions.tolist(),
                "confidence_interval": confidence_interval,
                "accuracy_metrics": {
                    "rmse": rmse,
                    "mae": mae,
                    "r2_score": r2
                },
                "forecast_dates": future_dates.strftime('%Y-%m-%d').tolist()
            }
            
        except Exception as e:
            raise Exception(f"Linear regression forecast failed: {str(e)}")
    
    def _moving_average_forecast(self, series: pd.Series, periods: int, window: int = 7) -> Dict[str, Any]:
        """Moving average forecasting"""
        try:
            # Calculate moving average
            ma = series.rolling(window=window).mean()
            last_ma = ma.iloc[-1]
            
            # Simple forecast: extend last moving average
            predictions = [last_ma] * periods
            
            # Simple confidence interval
            std_dev = series.rolling(window=window).std().iloc[-1]
            confidence_interval = {
                "lower": [last_ma - 1.96 * std_dev] * periods,
                "upper": [last_ma + 1.96 * std_dev] * periods
            }
            
            # Generate future dates
            last_date = series.index[-1] if hasattr(series.index, 'dtype') else datetime.now()
            if isinstance(last_date, str):
                last_date = pd.to_datetime(last_date)
            
            future_dates = pd.date_range(
                start=last_date + timedelta(days=1),
                periods=periods,
                freq='D'
            )
            
            # Calculate accuracy metrics
            ma_aligned = ma.dropna()
            series_aligned = series.loc[ma_aligned.index]
            
            # Ensure both series have the same length
            min_length = min(len(ma_aligned), len(series_aligned))
            ma_aligned = ma_aligned.iloc[:min_length]
            series_aligned = series_aligned.iloc[:min_length]
            
            rmse = np.sqrt(mean_squared_error(series_aligned, ma_aligned))
            mae = mean_absolute_error(series_aligned, ma_aligned)
            
            return {
                "predictions": predictions,
                "confidence_interval": confidence_interval,
                "accuracy_metrics": {
                    "rmse": rmse,
                    "mae": mae,
                    "window_size": window
                },
                "forecast_dates": future_dates.strftime('%Y-%m-%d').tolist()
            }
            
        except Exception as e:
            raise Exception(f"Moving average forecast failed: {str(e)}")


# Singleton instance
forecast_service = ForecastService()
