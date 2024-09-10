import streamlit as st

def display_interests():
    # Inject CSS to hide the expand button on images
    hide_expand_button = """
        <style>
        button[title="View fullscreen"] {
            display: none !important;
        }
        </style>
    """
    # Apply the CSS to the app
    st.markdown(hide_expand_button, unsafe_allow_html=True)
    
    # Center, enlarge, underline, and italicize the title
    st.markdown("<h1 style='text-align: center; font-size: 48px; text-decoration: underline; font-style: italic;'>My Interests</h1>", unsafe_allow_html=True)
    
    # Create two columns: text on the left and the poker aces image on the right
    col1, col2 = st.columns([3, 1])

    with col1:
        # First two paragraphs about poker and gaming
        st.markdown(
            """
            <p style="font-size: 28px;">
            I'm passionate about astronomy, coding, poker, video games, and lifting. I enjoy exploring new ways to blend my interests, whether it's through a late-night poker game or experimenting with code. Poker, in particular, is my favorite - its blend of strategy, psychology, and skill makes it very fun to play, and I’m always looking to improve my game. 
            </p>
            <p style="font-size: 28px;">
            Gaming is another huge passion of mine. While I primarily play Valorant, I also enjoy diving into Fall Guys, Overwatch, Minecraft, and some others. I love the challenge that comes with these games, and love exploring new worlds and competing with friends. If you ever want to team up or play, feel free to reach out!
            </p>
            """, 
            unsafe_allow_html=True
        )

    with col2:
        # Display the poker aces image resized and aligned on the right
        st.markdown("<br><br><br>", unsafe_allow_html=True)
        st.image('main/images/aces.png', width=300)

    # Create another set of columns: telescope image on the left and text on the right
    col3, col4 = st.columns([1, 3])

    with col3:
        # Display the telescope image resized and aligned on the left
        st.markdown("<br><br><br>", unsafe_allow_html=True)
        st.image('main/images/telescope.jpg', width=300)

    with col4:
        # Second two paragraphs about astronomy and Marvel movies
        st.markdown(
            """
            <p style="font-size: 28px;">
            Interstellar is one of my all-time favorite movies. Beyond that, I’m a big Marvel fan, with Captain America, Deadpool, and Venom as my top three characters. I'm also a big TV watcher, with shows like The Office, Daredevil, and The Big Bang Theory being some of my favorites.
            </p>
            <p style="font-size: 28px;">
            My fascination with the universe continues to drive my interest in astronomy, whether it's stargazing through a telescope or diving into the latest cosmic discoveries. I have surrounded myself with a lot of astronomy-related activities, from my studies to my work, and I'm always looking for new ways to explore more.
            </p>
            """, 
            unsafe_allow_html=True
        )

    # Display the interstellar picture at the end with full width
    st.image('main/images/interstellar_pic.jpg', use_column_width=True)
