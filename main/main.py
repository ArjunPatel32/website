import streamlit as st
from main.customization import set_png_as_page_bg, load_images, create_footer
from main.sidebar import create_sidebar

# Set page configuration
st.set_page_config(
    page_title="Arjun Patel - Personal Website",
    layout="centered",
    initial_sidebar_state="expanded"
)

# Set background image
set_png_as_page_bg('main/images/background.jpg')

# Load images
profile_pic, interstellar_pic = load_images()

# Sidebar content
create_sidebar(profile_pic)

# Main content
st.image(interstellar_pic, use_column_width=True)
st.markdown("# Welcome")
st.markdown("### I'm Arjun Patel.")
st.markdown("I'm studying Astrophysics and Applied Math @ UC Berkeley.")
st.markdown("I'm passionate about astronomy, coding, and data science.")
st.markdown("Let's connect!")

# Links
st.markdown("""
<div class="links">
    <a href="https://www.linkedin.com/in/arjun-patel-045676255/">LinkedIn</a>
</div>
""", unsafe_allow_html=True)

# Footer content
create_footer()
