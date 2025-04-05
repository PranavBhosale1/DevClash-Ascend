import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.graph_objects as go
import random
from datetime import datetime, timedelta

def generate_mock_progress_data(days=30):
    """Generate mock data for learning progress over time."""
    dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days)]
    dates.reverse()
    
    # Generate progress data
    progress = [0]
    for i in range(1, days):
        # Add some randomness but ensure overall upward trend
        new_progress = progress[-1] + random.randint(0, 3)
        if random.random() < 0.2:  # 20% chance of a big learning day
            new_progress += random.randint(2, 5)
        progress.append(new_progress)
    
    # Generate streak data
    streak = 0
    streaks = []
    for i in range(days):
        if i > 0 and progress[i] > progress[i-1]:
            streak += 1
        else:
            streak = 0
        streaks.append(streak)
    
    return pd.DataFrame({
        'date': dates,
        'resources_completed': progress,
        'streak': streaks
    })

def generate_mock_resource_data():
    """Generate mock data for resource types and difficulty levels."""
    resource_types = ['video', 'article', 'exercise', 'project']
    difficulty_levels = ['beginner', 'intermediate', 'advanced']
    
    type_counts = [random.randint(5, 15) for _ in range(len(resource_types))]
    difficulty_counts = [random.randint(7, 20) for _ in range(len(difficulty_levels))]
    
    resource_type_df = pd.DataFrame({
        'type': resource_types,
        'count': type_counts
    })
    
    difficulty_df = pd.DataFrame({
        'level': difficulty_levels,
        'count': difficulty_counts
    })
    
    return resource_type_df, difficulty_df

def show_learning_progress():
    """Display learning progress visualizations."""
    st.header("Learning Progress Analytics", divider="blue")
    
    # Generate mock data
    progress_data = generate_mock_progress_data()
    resource_type_df, difficulty_df = generate_mock_resource_data()
    
    # Create two columns for the charts
    col1, col2 = st.columns(2)
    
    # Learning progress over time
    with col1:
        st.subheader("Resources Completed Over Time")
        fig = px.line(
            progress_data, 
            x='date', 
            y='resources_completed',
            markers=True,
            line_shape='spline',
            color_discrete_sequence=['#4f46e5']
        )
        fig.update_layout(
            xaxis_title="Date",
            yaxis_title="Completed Resources",
            height=300,
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Learning streak
    with col2:
        st.subheader("Learning Streak")
        fig = px.bar(
            progress_data, 
            x='date', 
            y='streak',
            color_discrete_sequence=['#4f46e5']
        )
        fig.update_layout(
            xaxis_title="Date",
            yaxis_title="Streak Days",
            height=300,
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Resource type distribution
    col3, col4 = st.columns(2)
    
    with col3:
        st.subheader("Resource Types")
        fig = px.pie(
            resource_type_df, 
            values='count', 
            names='type',
            color_discrete_sequence=px.colors.qualitative.Pastel,
            hole=0.4
        )
        fig.update_layout(height=300)
        st.plotly_chart(fig, use_container_width=True)
    
    with col4:
        st.subheader("Difficulty Distribution")
        fig = px.bar(
            difficulty_df, 
            x='level', 
            y='count',
            color='level',
            color_discrete_map={
                'beginner': '#93c5fd',
                'intermediate': '#fde68a',
                'advanced': '#fca5a5'
            }
        )
        fig.update_layout(
            xaxis_title="Difficulty Level",
            yaxis_title="Number of Resources",
            showlegend=False,
            height=300
        )
        st.plotly_chart(fig, use_container_width=True)

def show_completion_tracker(learning_path):
    """Display a completion tracker for the learning path."""
    if not learning_path:
        return
    
    # Calculate total resources and modules
    total_resources = sum(len(module["resources"]) for module in learning_path["modules"])
    completed_resources = 0  # In a real app, this would come from user data
    
    # Create the gauge chart
    fig = go.Figure(go.Indicator(
        mode = "gauge+number",
        value = completed_resources,
        domain = {'x': [0, 1], 'y': [0, 1]},
        title = {'text': "Progress"},
        gauge = {
            'axis': {'range': [None, total_resources], 'tickwidth': 1},
            'bar': {'color': "#4f46e5"},
            'steps': [
                {'range': [0, total_resources/3], 'color': "#ede9fe"},
                {'range': [total_resources/3, 2*total_resources/3], 'color': "#ddd6fe"},
                {'range': [2*total_resources/3, total_resources], 'color': "#c4b5fd"}
            ],
        }
    ))
    
    fig.update_layout(height=200)
    st.plotly_chart(fig, use_container_width=True)
    
    # Module-by-module breakdown
    st.subheader("Module Completion")
    
    for i, module in enumerate(learning_path["modules"]):
        module_resources = len(module["resources"])
        module_completed = 0  # In a real app, this would come from user data
        
        # Calculate completion percentage
        completion_percent = (module_completed / module_resources) * 100 if module_resources > 0 else 0
        
        # Display progress bar for each module
        st.caption(f"Module {i+1}: {module['title']}")
        st.progress(completion_percent / 100, text=f"{module_completed}/{module_resources} resources") 