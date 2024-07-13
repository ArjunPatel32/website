import streamlit as st
import base64

def set_background(image_path: str):
    """function to set background image of website"""
    # function found from here: https://discuss.streamlit.io/t/how-do-i-use-a-background-image-on-streamlit/5067/15

    main_bg_ext = "png"
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode()

    st.markdown(
        f"""
         <style>
         .stApp {{
             background: url(data:image/{main_bg_ext};base64,{encoded_string});
             background-size: cover;
         }}
         </style>
         """,
        unsafe_allow_html=True,
    )

def create_footer():
    st.markdown("""
    <hr style='border: none; border-top: 1px dashed gray;'>
    <footer style='padding: 10px 0; text-align: center; color: gray; font-size: small;'>
        <p>&copy; 2024 Arjun Patel. All rights reserved.</p>
    </footer>
    """, unsafe_allow_html=True)

def main_content():
    st.markdown(
        """
        <h4>I'm currently a sophomore at UC Berkeley studying Astrophysics and Applied Math, with a concentration in statistics.</h4>
        <h4>I'm passionate about astronomy, coding, poker, video games, and lifting. I'm always looking for more ways to explore my interests, especially poker. If you know of any good resources or want to play a game, feel free to reach out!</h4>
        <h4>I am an Assistant Telescope Officer at the Undergraduate Astronomy Society at UC Berkeley, operating various telescopes for events. I've been trained in activating and functioning different telescopes, including Treffers, Cassegrain, Newtonian, & EV.</h4>
        <h4>I'm currently working as a Data Science Intern at Dotlas. I've developed web scrapers and data collectors at Dotlas, gathering and analyzing large datasets. I also worked with different LLMs and APIs to automate data collection and analysis.</h4>
        <h4>I've also worked as a Research Assistant at the University of Rochester Laboratory for Laser Energetics, where I utilized COMSOL Multiphysics for modeling experiments on electromagnetic radiation detection. I explored the use of terahertz radiation to differentiate between healthy and cancerous tissues and evaluated the impact of embedding tissues in paraffin wax to mimic real-life samples.</h4>
        <h4>Check out my socials and feel free to reach out if you want to chat or collaborate!</h4>
        """,
        unsafe_allow_html=True
    )
