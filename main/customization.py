import streamlit as st
import base64

def set_background(image_path: str):
    """function to set background image of website"""
    # function found from here: https://discuss.streamlit.io/t/how-do-i-use-a-background-image-on-streamlit/5067/15

    # set bg name
    main_bg_ext = "png"

    st.markdown(
        f"""
         <style>
         .stApp {{
             background: url(data:image/{main_bg_ext};base64,{base64.b64encode(open(image_path, "rb").read()).decode()});
             background-size: cover
         }}
         </style>
         """,
        unsafe_allow_html=True,
    )

def create_footer():
    st.markdown("""
    <footer style='padding: 10px 0; text-align: center; color: gray; font-size: small;'>
        <p>&copy; 2024 Arjun Patel. All rights reserved.</p>
    </footer>
    """, unsafe_allow_html=True)

def main_content():
    st.markdown("I'm currently a sophmore at UC Berkeley studying Astrophysics and Applied Math, with a concentration in statistics.")

    st.markdown(
        '''
        I'm passionate about astronomy (my favorite movie is interstellar if you couldn't tell from the black hole), coding, poker, videogames, and lifting. 
        I'm looking for more ways to explore my interests, especially poker. If you know of any good resources or want to play a game, feel free to reach out!
        ''')

    st.markdown(
        '''
        I am an Assistant Telescope Officer at the Undergraduate Astronomy Society at UC Berkelet, operating various telescopes for events.
        I've been trained in activating and functioning different telescopes, including Treffers, Cassegrain, Newtonian, & EV.
        ''')

    st.markdown(
        '''I'm currently working a Data Science Intern at Dotlas.
        I've developed web scrapers and data collectors at Dotlas, gathering and analyzing large datasets. 
        I also worked with different LLMs and APIs to automate data collection and analysis.
        ''')

    st.markdown(
        '''I've also worked as a Research Assistant at the University of Rochester Laboratory for Laser Energetics, where I 
        utilized COMSOL Multiphysics for modeling experiments on electromagnetic radiation detection. 
        I explored the use of terahertz radiation to differentiate between healthy and cancerous tissues and 
        evaluated the impact of embedding tissues in paraffin wax to mimic real-life samples.
        ''')

    st.markdown(
        '''
        Check out my socials and feel free to reach out if you want to chat or collaborate!
        ''')
