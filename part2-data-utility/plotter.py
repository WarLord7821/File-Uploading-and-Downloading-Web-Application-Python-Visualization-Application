import sys
import pandas as pd
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import filedialog

def select_file() -> str:
    """Opens a native file dialog for the user to select a CSV file."""
    # Initialize tkinter and hide the main background window
    root = tk.Tk()
    root.withdraw()
    
    # Force the dialog to appear on top of other windows
    root.attributes('-topmost', True)
    
    print("Opening file picker...")
    file_path = filedialog.askopenfilename(
        title="Select a CSV File",
        filetypes=(("CSV files", "*.csv"), ("All files", "*.*"))
    )
    return file_path

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
    # Basic error handling: check if the Y-axis data is numeric
    if not pd.api.types.is_numeric_dtype(df[y_col]):
        print(f"\n[Warning] The selected Y-axis column '{y_col}' contains non-numeric data.")
        print("Matplotlib may fail or produce an unexpected plot. Attempting to plot anyway...\n")

    # Set up the figure size
    plt.figure(figsize=(10, 6))

    try:
        # Generate the selected plot type
        if plot_type == 'line':
            plt.plot(df[x_col], df[y_col], marker='o', linestyle='-', color='b')
        elif plot_type == 'bar':
            plt.bar(df[x_col], df[y_col], color='b')

        # Add labels and formatting
        plt.title(f"{plot_type.capitalize()} Plot: {y_col} vs {x_col}")
        plt.xlabel(x_col)
        plt.ylabel(y_col)
        
        # Rotate X-axis labels in case they are long strings (like dates)
        plt.xticks(rotation=45, ha='right')
        
        # Adjust layout so labels aren't cut off
        plt.tight_layout()
        
        # Display the plot
        plt.show()
        
    except Exception as e:
        print(f"\n[Error] An error occurred while generating the plot: {e}")

def main():
    print("--- CSV Data Plotting Utility ---")
    
    # 1. Select the file
    file_path = select_file()
    if not file_path:
        print("No file was selected. Exiting program.")
        sys.exit()

    print(f"\nLoading file: {file_path}")

    # 2. Read the CSV
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        print(f"[Error] Failed to read the CSV file: {e}")
        sys.exit()

    if df.empty:
        print("The selected CSV file is empty. Exiting program.")
        sys.exit()

    # 3. Print available columns
    print("\nAvailable columns:")
    columns = df.columns.tolist()
    for idx, col in enumerate(columns, start=1):
        print(f"  {idx}. {col}")
    print("-" * 30)

    # 4. Get user selections
    x_col = get_column_choice(columns, "X")
    y_col = get_column_choice(columns, "Y")
    print("-" * 30)
    plot_type = get_plot_type()

    # 5. Plot the data
    print("\nGenerating plot... (Close the plot window to exit the script)")
    plot_data(df, x_col, y_col, plot_type)

if __name__ == "__main__":
    main()