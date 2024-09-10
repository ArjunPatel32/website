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
        "Go to",
        options=["About Me", "Interests", "Work", "Extracurriculars"]
    )

    st.sidebar.header("Contact", divider='blue')
    st.sidebar.markdown("""
    <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; align-items: center;">
            <img src="https://img.icons8.com/ios-filled/50/000000/phone.png" width="20" style="margin-right: 10px;"/> 
            (585) 733 - 6934
        </div>
        <div style="display: flex; align-items: center;">
            <img src="https://img.icons8.com/ios-filled/50/000000/email.png" width="20" style="margin-right: 10px;"/> 
            arjun360patel@gmail.com
        </div>
        <div style="display: flex; align-items: center;">
            <img src="https://img.icons8.com/ios-filled/50/000000/email.png" width="20" style="margin-right: 10px;"/> 
            arjun_patel3@berkeley.edu
        </div>
    </div>
    """, unsafe_allow_html=True)


    st.sidebar.markdown("<bv>", unsafe_allow_html=True)
    st.sidebar.header("Socials", divider='blue')
    st.sidebar.markdown("""
    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        <a href="https://www.instagram.com/appatel_04/" style="flex: 1; display: flex; align-items: center;">
            <img src="https://img.icons8.com/ios-filled/50/000000/instagram-new.png" width="20" style="margin-right: 10px;"/> Instagram
        </a>
        <a href="https://www.linkedin.com/in/arjun-patel-045676255/" style="flex: 1; display: flex; align-items: center;">
            <img src="https://img.icons8.com/ios-filled/50/000000/linkedin.png" width="20" style="margin-right: 10px;"/> LinkedIn
        </a>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        <a href="https://open.spotify.com/user/iw4k26n6xg2jmm8z55ca78ecl" style="flex: 1; display: flex; align-items: center;">
            <img src="https://img.icons8.com/ios-filled/50/000000/spotify.png" width="20" style="margin-right: 10px;"/> Spotify
        </a>
        <a href="https://github.com/ArjunPatel32" style="flex: 1; display: flex; align-items: center;">
            <img src="https://img.icons8.com/ios-filled/50/000000/github.png" width="20" style="margin-right: 10px;"/> GitHub
        </a>
    </div>
    """, unsafe_allow_html=True)

    return page
