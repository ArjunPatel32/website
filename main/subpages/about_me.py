import streamlit as st

def display_about_me():
    # Center, enlarge, underline, and italicize the title
    st.markdown("<h1 style='text-align: center; font-size: 48px; text-decoration: underline; font-style: italic;'>About Me</h1>", unsafe_allow_html=True)
    
    # Create two columns: text on the left, image on the right
    col1, col2 = st.columns([3, 1])

    with col1:
        # Introductory text with increased font size
        st.markdown("<h1 style='font-size: 36px;'>I'm Arjun Patel 😎</h1>", unsafe_allow_html=True)
        st.markdown(
            """
            <p style="font-size: 28px;">
            I’m a sophomore at UC Berkeley, where I study Astrophysics and Applied Math with a concentration in statistics. I’m very interested in solving the mysteries of the universe through my work and studies, and I’m currently engaged in research and projects that bridge data science and astrophysics.
            </p>
            <p style="font-size: 28px;">
            I currently work as a Data Science Intern at Dotlas, where I develop tools to analyze large datasets and automate data processes. Additionally, I recently started a new research position at the Rubin Observatory, focusing on advancing observational techniques and data analysis.
            </p>
            """, 
            unsafe_allow_html=True
        )

    with col2:
        # Add some space and display the profile picture
        st.markdown("<br><br><br>", unsafe_allow_html=True)
        st.image('main/images/profile_pic.jpg', width=225)

    # Create another set of columns with the profile picture on the left and text on the right
    col3, col4 = st.columns([1, 3])

    with col3:
        # Add some space before displaying the profile picture again if needed
        st.markdown("<br>", unsafe_allow_html=True)
        st.image('main/images/space_poker.png', width=300)

    with col4:
        # Additional descriptive text with increased font size
        st.markdown(
            """
            <p style="font-size: 28px;">
            Beyond academics, I’m actively involved as a Telescope Officer with the Undergraduate Astronomy Society, where I help operate and train others on a variety of telescopes, sharing my enthusiasm for stargazing and exploration.
            </p>
            <p style="font-size: 28px;">
            When I’m not in school or working, you’ll often find me playing poker, lifting weights, or grinding some video games. I’m always on the lookout for new ways to explore and expand my interests, especially in poker. If you have any tips or want to play a game, let me know!
            </p>
            """, 
            unsafe_allow_html=True
        )

    # Center the final call-to-action paragraph and match the font size
    st.markdown(
        """
        <p style="text-align: center; font-size: 28px;">
        Feel free to reach out using my contact information or connect with me on my socials!
        </p>
        """, 
        unsafe_allow_html=True
    )
