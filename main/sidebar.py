import streamlit as st

def create_sidebar(profile_pic):
    st.sidebar.header("About Mexxxx", divider='blue')
    st.sidebar.image(profile_pic, width=150)
    st.sidebar.markdown("""
    ### Arjun Patel
    Astrophysics & Applied Math @ UC Berkeley
    Data Science Intern at [Dotlas](https://dotlas.com/)
    """)
    
    st.sidebar.header("Contact", divider='blue')
    st.sidebar.markdown("""
    (585) 733 - 6934  
    arjun360patel@gmail.com  
    arjun_patel3@berkeley.edu
    """)
    
    st.sidebar.header("Socials", divider='blue')
    st.sidebar.markdown("""
    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        <a href="https://www.instagram.com/appatel_04/" style="flex: 1;">Instagram</a>
        <a href="https://www.linkedin.com/in/arjun-patel-045676255/" style="flex: 1;">LinkedIn</a>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        <a href="https://open.spotify.com/user/iw4k26n6xg2jmm8z55ca78ecl" style="flex: 1;">Spotify</a>
        <a href="https://github.com/ArjunPatel32" style="flex: 1;">Github</a>
    </div>
    """, unsafe_allow_html=True)
