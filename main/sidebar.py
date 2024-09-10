import streamlit as st

def create_sidebar():
    # Add a header with your name and the selected quote
    st.sidebar.markdown(
        """
        <div style="text-align: center;">
            <h2 style="text-decoration: underline; margin-bottom: 5px;">Arjun Patel</h2>
            <em style="font-size: 18px; color: gray;">From Telescopes to Turn Cards</em>
        </div>
        """, 
        unsafe_allow_html=True
    )

    st.sidebar.header("Navigation", divider='blue')
    page = st.sidebar.radio(
        "Go to",  # Re-added the "Go to" text here
        options=["About Me", "Interests", "Work", "Extracurriculars"]
    )

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
        <a href="https://github.com/ArjunPatel32" style="flex: 1;">GitHub</a>
    </div>
    """, unsafe_allow_html=True)

    return page
