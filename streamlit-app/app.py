import streamlit as st
import pandas as pd
import json
import random
import time
from data_visualization import show_learning_progress, show_completion_tracker

# Set page config
st.set_page_config(
    page_title="Ascend Flow - Learning Path Generator",
    page_icon="🚀",
    layout="wide"
)

# Custom CSS for styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #4f46e5;
    }
    .sub-header {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }
    .resource-card {
        background-color: #f9fafb;
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 1rem;
        border-left: 4px solid #4f46e5;
    }
    .module-header {
        background-color: #f3f4f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 24px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        white-space: pre-wrap;
        border-radius: 4px 4px 0px 0px;
        padding: 10px 16px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("<h1 class='main-header'>Ascend Flow</h1>", unsafe_allow_html=True)
st.markdown("<h2 class='sub-header'>AI-Powered Learning Path Generator</h2>", unsafe_allow_html=True)

# Sidebar for inputs
with st.sidebar:
    st.header("Create Your Learning Path")
    
    # Skill input
    skill = st.text_input("What skill do you want to learn?", "Data Science")
    
    # Popular skills for quick selection
    st.write("Popular skills:")
    popular_skills = [
        "Web Development", 
        "Data Science", 
        "Machine Learning", 
        "Mobile Development", 
        "UI/UX Design", 
        "Blockchain"
    ]
    selected_skill = st.selectbox("Or choose a popular skill:", 
                                 options=["Custom"] + popular_skills)
    if selected_skill != "Custom":
        skill = selected_skill
    
    # Time commitment
    st.write("Time commitment:")
    time_commitment = st.radio(
        "How much time can you dedicate?",
        options=["1-week", "1-month", "3-months"],
        index=1
    )
    
    # Generate button
    generate_btn = st.button("Generate Learning Path", type="primary", use_container_width=True)

# Mock data generation (similar to the fallbackToMockData function in gemini.ts)
def generate_mock_learning_path(skill, time_commitment):
    # Module templates
    module_templates = [
        {"title": f"Introduction to {skill}", "description": f"Get started with the fundamentals of {skill}"},
        {"title": f"Core Concepts of {skill}", "description": f"Build a solid foundation in {skill}"},
        {"title": f"Practical {skill} Projects", "description": f"Apply your knowledge with hands-on projects"},
        {"title": f"Advanced {skill} Techniques", "description": f"Take your skills to the next level"},
        {"title": f"Mastering {skill}", "description": f"Become proficient in advanced concepts and real-world applications"}
    ]
    
    # Resource templates
    resource_templates = [
        {"type": "video", "title": "{topic} Tutorial", "description": "A comprehensive video guide on {topic}"},
        {"type": "article", "title": "Understanding {topic}", "description": "An in-depth article explaining {topic}"},
        {"type": "exercise", "title": "Practice: {topic}", "description": "Hands-on exercises to master {topic}"},
        {"type": "project", "title": "Build a {topic} Project", "description": "Step-by-step guide to create a {topic} project"}
    ]
    
    # Topics related to learning
    topics = [
        "Fundamentals", 
        "Core Concepts", 
        "Best Practices",
        "Advanced Techniques", 
        "Practical Applications",
        "Future Trends"
    ]
    
    # Determine module count based on time commitment
    module_count = 3
    if time_commitment == "1-week":
        module_count = 2
    elif time_commitment == "3-months":
        module_count = 5
    
    # Generate modules
    modules = []
    for i in range(module_count):
        module_template = module_templates[i % len(module_templates)]
        module_title = module_template["title"]
        module_description = module_template["description"]
        
        # Generate resources for this module
        resources = []
        resource_count = random.randint(3, 5)
        
        for j in range(resource_count):
            topic = topics[(i * resource_count + j) % len(topics)]
            resource_template = resource_templates[j % len(resource_templates)]
            
            resource_title = resource_template["title"].replace("{topic}", topic)
            resource_description = resource_template["description"].replace("{topic}", topic)
            
            difficulty = "beginner" if i == 0 else "advanced" if i == module_count - 1 else "intermediate"
            estimated_time = random.randint(15, 45)
            
            resources.append({
                "id": f"resource-{i}-{j}",
                "title": resource_title,
                "description": resource_description,
                "resourceType": resource_template["type"],
                "url": f"https://www.youtube.com/results?search_query={resource_title.replace(' ', '+')}+{skill.replace(' ', '+')}" if resource_template["type"] == "video" else None,
                "content": "This is the content of the article..." if resource_template["type"] == "article" else None,
                "difficultyLevel": difficulty,
                "estimatedTime": estimated_time
            })
        
        modules.append({
            "id": f"module-{i}",
            "title": module_title,
            "description": module_description,
            "resources": resources,
            "position": i
        })
    
    return {
        "id": "roadmap-" + str(random.randint(1000, 9999)),
        "title": f"Learn {skill}",
        "description": f"A comprehensive learning path to master {skill} in {time_commitment.replace('-', ' ')}",
        "modules": modules
    }

# State to hold the learning path
if 'learning_path' not in st.session_state:
    st.session_state.learning_path = None

# Generate learning path
if generate_btn:
    with st.spinner("Generating your personalized learning path..."):
        # Add a realistic delay to simulate API call
        time.sleep(2)
        st.session_state.learning_path = generate_mock_learning_path(skill, time_commitment)

# Display the learning path
if st.session_state.learning_path:
    learning_path = st.session_state.learning_path
    
    # Create tabs for different views
    tabs = st.tabs(["Learning Path", "Analytics", "Resources"])
    
    # Tab 1: Learning Path
    with tabs[0]:
        st.markdown(f"<h2>{learning_path['title']}</h2>", unsafe_allow_html=True)
        st.write(learning_path["description"])
        
        # Progress tracker
        total_resources = sum(len(module["resources"]) for module in learning_path["modules"])
        st.progress(0.0, text=f"0/{total_resources} resources completed")
        
        # Display modules and resources
        for module in learning_path["modules"]:
            with st.expander(f"Module {module['position'] + 1}: {module['title']}", expanded=True):
                st.markdown(f"<div class='module-header'><h3>{module['title']}</h3><p>{module['description']}</p></div>", unsafe_allow_html=True)
                
                for resource in module["resources"]:
                    st.markdown(f"""
                    <div class='resource-card'>
                        <h4>{resource['title']} <span style='background-color: {'#dbeafe' if resource['difficultyLevel'] == 'beginner' else '#fef3c7' if resource['difficultyLevel'] == 'intermediate' else '#fee2e2'}; padding: 2px 8px; border-radius: 9999px; font-size: 0.7em;'>{resource['difficultyLevel'].capitalize()}</span></h4>
                        <p>{resource['description']}</p>
                        <p>Estimated time: {resource['estimatedTime']} minutes</p>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    if resource["resourceType"] == "video" and resource.get("url"):
                        st.markdown(f"[Open Video Search]({resource['url']})")
                    
                    # Completion checkbox
                    st.checkbox(f"Mark '{resource['title']}' as completed", key=f"check_{resource['id']}")
        
        # Save button
        st.download_button(
            label="Download Learning Path as JSON",
            data=json.dumps(learning_path, indent=2),
            file_name=f"{skill.lower().replace(' ', '_')}_learning_path.json",
            mime="application/json"
        )
    
    # Tab 2: Analytics
    with tabs[1]:
        show_completion_tracker(learning_path)
        show_learning_progress()
    
    # Tab 3: Resources
    with tabs[2]:
        st.header("Learning Resources")
        
        # Filter options
        col1, col2 = st.columns(2)
        with col1:
            filter_type = st.multiselect(
                "Filter by type:",
                options=["video", "article", "exercise", "project"],
                default=[]
            )
        
        with col2:
            filter_difficulty = st.multiselect(
                "Filter by difficulty:",
                options=["beginner", "intermediate", "advanced"],
                default=[]
            )
        
        # Gather all resources
        all_resources = []
        for module in learning_path["modules"]:
            for resource in module["resources"]:
                resource["module"] = module["title"]
                all_resources.append(resource)
        
        # Apply filters
        filtered_resources = all_resources
        if filter_type:
            filtered_resources = [r for r in filtered_resources if r["resourceType"] in filter_type]
        if filter_difficulty:
            filtered_resources = [r for r in filtered_resources if r["difficultyLevel"] in filter_difficulty]
        
        # Display resources
        if not filtered_resources:
            st.info("No resources match your filters")
        else:
            for resource in filtered_resources:
                st.markdown(f"""
                <div class='resource-card'>
                    <h4>{resource['title']} <span style='background-color: {'#dbeafe' if resource['difficultyLevel'] == 'beginner' else '#fef3c7' if resource['difficultyLevel'] == 'intermediate' else '#fee2e2'}; padding: 2px 8px; border-radius: 9999px; font-size: 0.7em;'>{resource['difficultyLevel'].capitalize()}</span></h4>
                    <p>Module: {resource['module']}</p>
                    <p>{resource['description']}</p>
                    <p>Type: {resource['resourceType']} | Estimated time: {resource['estimatedTime']} minutes</p>
                </div>
                """, unsafe_allow_html=True)
                
                if resource["resourceType"] == "video" and resource.get("url"):
                    st.markdown(f"[Open Video Search]({resource['url']})")

# Footer
st.markdown("---")
st.markdown("Powered by Ascend Flow - Your personal learning companion") 