import streamlit as st

def create_sidebar(profile_pic):
    st.sidebar.markdown("# About Me")
    st.sidebar.image(profile_pic, width=150)
    st.sidebar.markdown("### Arjun Patel")
    st.sidebar.markdown("Astrophysics and Applied Math student @ UC Berkeley.")
    st.sidebar.markdown("Passionate about astronomy, coding, and data science.")
    st.sidebar.markdown("[LinkedIn](https://www.linkedin.com/in/arjun-patel-045676255/)")
