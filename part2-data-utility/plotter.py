import sys
import pandas as pd
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import filedialog
import urllib.error

def select_local_file() -> str:
    """Opens a native file dialog for the user to select a CSV file."""
    root = tk.Tk()
    root.withdraw() # Hide the main window
    root.attributes('-topmost', True) # Force on top
    
    print("Opening file picker...")
    file_path = filedialog.askopenfilename(
        title="Select a CSV File",
        filetypes=(("CSV files", "*.csv"), ("All files", "*.*"))
    )
    return file_path

def get_data_source() -> str:
    """Prompts the user to choose between a local file or a URL."""
    while True:
        print("\nData Source Selection:")
        print("1. Select a local file")
        print("2. Enter a URL for a CSV")
        choice = input("Enter your choice (1 or 2): ").strip()
        
        if choice == '1':
            source = select_local_file()
            if not source:
                print("No file selected. Exiting.")
                sys.exit()
            return source
        elif choice == '2':
            source = input("Paste the CSV URL: ").strip()
            if not source:
                print("No URL provided. Exiting.")
                sys.exit()
            return source
        else:
            print("Invalid choice. Please enter 1 or 2.")

def load_data(source: str) -> pd.DataFrame:
    """Loads the CSV data from a file path or URL into a DataFrame."""
    print(f"\nAttempting to load data from: {source}")
    try:
        df = pd.read_csv(source)
        return df
    except urllib.error.URLError as e:
        print(f"\n[Error] Network issue or invalid URL: {e.reason}")
        sys.exit()
    except urllib.error.HTTPError as e:
        print(f"\n[Error] HTTP Error encountered: {e.code} - {e.reason}")
        sys.exit()
    except FileNotFoundError:
        print("\n[Error] The specified local file was not found.")
        sys.exit()
    except pd.errors.EmptyDataError:
        print("\n[Error] The selected CSV file is empty.")
        sys.exit()
    except Exception as e:
        print(f"\n[Error] Failed to read the CSV data: {e}")
        sys.exit()

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Checks for NaN values and prompts the user to resolve them if found."""
    missing_cells = df.isnull().sum().sum()
    
    if missing_cells == 0:
        print("Data check passed: No missing values detected.")
        return df
        
    print(f"\n[Warning] Missing data detected: {missing_cells} empty cell(s) found.")
    
    while True:
        print("How would you like to handle the missing data?")
        print("1. Drop rows with missing data")
        print("2. Fill missing data with 0")
        choice = input("Enter your choice (1 or 2): ").strip()
        
        if choice == '1':
            initial_rows = len(df)
            df = df.dropna()
            dropped_count = initial_rows - len(df)
            print(f"Dropped {dropped_count} row(s) containing missing data.")
            return df
        elif choice == '2':
            df = df.fillna(0)
            print("Filled all missing cells with 0.")
            return df
        else:
            print("Invalid choice. Please enter 1 or 2.")

def get_column_choice(columns: list, axis_name: str) -> str:
    """Prompts the user to select a column by its numbered index."""
    while True:
        try:
            choice = int(input(f"Select the column number for the {axis_name}-axis: "))
            if 1 <= choice <= len(columns):
                return columns[choice - 1]
            else:
                print(f"Invalid choice. Please enter a number between 1 and {len(columns)}.")
        except ValueError:
            print("Invalid input. Please enter a valid number.")

def get_plot_type() -> str:
    """Prompts the user to choose between a line or bar graph."""
    while True:
        choice = input("Choose plot type ('line' or 'bar'): ").strip().lower()
        if choice in ['line', 'bar']:
            return choice
        print("Invalid choice. Please type 'line' or 'bar'.")

def plot_data(df: pd.DataFrame, x_col: str, y_col: str, plot_type: str):
    """Generates and displays the requested matplotlib plot."""
    # Robust error handling for non-numeric Y-axis data
    if not pd.api.types.is_numeric_dtype(df[y_col]):
        print(f"\n[Warning] The selected Y-axis column '{y_col}' contains non-numeric data.")
        print("Matplotlib may fail, plot categorically, or produce an unexpected chart.")
        print("Attempting to plot anyway...\n")

    plt.figure(figsize=(10, 6))

    try:
        if plot_type == 'line':
            plt.plot(df[x_col], df[y_col], marker='o', linestyle='-', color='indigo')
        elif plot_type == 'bar':
            plt.bar(df[x_col], df[y_col], color='indigo')

        plt.title(f"{plot_type.capitalize()} Plot: {y_col} vs {x_col}")
        plt.xlabel(x_col)
        plt.ylabel(y_col)
        
        # Rotate X-axis labels to prevent overlap
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        
        plt.show()
        
    except Exception as e:
        print(f"\n[Error] A fatal error occurred while generating the plot: {e}")

def main():
    print("--- Advanced CSV Data Plotting Utility ---")
    
    # 1. Select data source and load data
    source = get_data_source()
    raw_df = load_data(source)
    
    if raw_df.empty:
        print("[Error] The loaded CSV data is completely empty. Exiting.")
        sys.exit()

    # 2. Automated Data Cleaning
    df = clean_data(raw_df)

    # 3. Print available columns
    print("\nAvailable columns:")
    columns = df.columns.tolist()
    for idx, col in enumerate(columns, start=1):
        print(f"  {idx}. {col}")
    print("-" * 40)

    # 4. Get user selections
    x_col = get_column_choice(columns, "X")
    y_col = get_column_choice(columns, "Y")
    print("-" * 40)
    plot_type = get_plot_type()

    # 5. Plot the data
    print("\nGenerating plot... (Close the plot window to exit the script)")
    plot_data(df, x_col, y_col, plot_type)

if __name__ == "__main__":
    main()