import streamlit as st
from customization import set_background, create_footer, main_content
from sidebar import create_sidebar

st.set_page_config(
    page_title="Arjun Patels Website",
    layout="centered",
    initial_sidebar_state="expanded"
)

set_background('main/images/background.png')

create_sidebar('main/images/profile_pic.jpg')

col1, col2 = st.columns([1, 1])

with col1:
    st.markdown("# Welcome :sunglasses:")
    st.markdown("## I'm Arjun Patel")

with col2:
    st.image('main/images/aces.png', width=250)

main_content()

st.image('main/images/interstellar_pic.jpg', use_column_width=True)

create_footer()
