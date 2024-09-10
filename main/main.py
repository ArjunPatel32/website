import streamlit as st
from customization import set_background, create_footer
from sidebar import create_sidebar
from subpages.interests import display_interests
from subpages.work import display_work
from subpages.extracurriculars import display_extracurriculars
from subpages.about_me import display_about_me

# Set the page layout to wide, this needs to be the first command
st.set_page_config(page_title="Arjun Patel's Website", layout="wide", initial_sidebar_state="expanded")

with st.spinner('Loading background and sidebar...'):
    set_background('main/images/background.png')
    selected_page = create_sidebar()

with st.spinner('Loading content...'):
    if selected_page == "About Me":
        display_about_me()
    
    elif selected_page == "Interests":
        display_interests()
    
    elif selected_page == "Work":
        display_work()
    
    elif selected_page == "Extracurriculars":
        display_extracurriculars()

with st.spinner('Finalizing...'):
    create_footer()
