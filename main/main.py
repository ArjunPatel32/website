import streamlit as st
from customization import set_background, create_footer, main_content
from sidebar import create_sidebar

# Set page configuration
st.set_page_config(
    page_title="Arjun Patels Website",
    layout="centered",
    initial_sidebar_state="expanded"
)

# Set background image
set_background('main/images/background.png')

# Load images
profile_pic = 'main/images/profile_pic.jpg'
interstellar_pic = 'main/images/interstellar_pic.jpg'

# Sidebar content
create_sidebar(profile_pic)

# Main content
st.image(interstellar_pic, use_column_width=True)
st.markdown("# Welcome")
st.markdown("### I'm Arjun Patel.")

main_content()

create_footer()
