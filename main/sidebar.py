import streamlit as st

def create_sidebar(profile_pic):
    st.sidebar.markdown("# About Me")
    st.sidebar.image(profile_pic, width=150)
    st.sidebar.markdown("### Arjun Patel")
    st.sidebar.markdown("Astrophysics & Applied Math @ UC Berkeley")
    st.sidebar.markdown('''Data Science Intern at [Dotlas](https://dotlas.com/)''')

    st.sidebar.markdown("## Contact")
    st.sidebar.markdown("(585) 733 - 6934")
    st.sidebar.markdown("arjun360patel@gmail.com")
    st.sidebar.markdown("arjun_patel3@berkeley.edu")


    st.sidebar.markdown("## Socials")
    st.sidebar.markdown("""
    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        <a href="https://www.instagram.com/appatel_04/" style="flex: 1;">Instagram</a>
        <a href="https://www.linkedin.com/in/arjun-patel-045676255/" style="flex: 1;">LinkedIn</a>
    </div>
    """, unsafe_allow_html=True)
    st.sidebar.markdown("""
    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        <a href="https://open.spotify.com/user/iw4k26n6xg2jmm8z55ca78ecl" style="flex: 1;">Spotify</a>
        <a href="https://github.com/ArjunPatel32" style="flex: 1;">Github</a>
    </div>
    """, unsafe_allow_html=True)



