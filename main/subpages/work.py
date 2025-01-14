import streamlit as st

def display_work():
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
    st.markdown("<h1 style='text-align: center; font-size: 48px; text-decoration: underline; font-style: italic;'>Work</h1>", unsafe_allow_html=True)

    # First section: Rubin Observatory
    col1, col2 = st.columns([3, 1])

    with col1:
        # Rubin Observatory work details with increased font size
        st.markdown(
            """
            <p style="font-size: 28px;">
            I am currently conducting research under the mentorship of Dean Steven Kahn at the Rubin Observatory. 
            I've engineered a pipeline to analyze and compare telescope chamber temperatures across different date ranges, and 
            automated 2D and 3D visualizations to illustrate variations in elevation and temperature across axis offsets.
            </p>
            """, 
            unsafe_allow_html=True
        )

    with col2:
        # Display the Rubin Observatory image on the left side
        st.image('main/images/rubin_observatory.jpg', width=250)

    # Second section: NASA Project
    col3, col4 = st.columns([1, 3])

    with col3:
            # Display the NASA logo on the right side
            st.image('main/images/nasa_logo.jpg', width=200)

    with col4:
        # NASA project work experience details with increased font size
        st.markdown(
            """
            <p style="font-size: 28px;">
            As part of a NASA-sponsored project, I analyzed technology gaps in small satellite advancements for science and exploration missions. 
            This involved assessing propulsion, power, autonomous systems, and communication/navigation technologies, comparing the NASA shortfall 
            and state-of-the-art reports to identify successes and areas for improvement.
            </p>
            """, 
            unsafe_allow_html=True
        )

    # Third section: Dotlas
    col5, col6 = st.columns([3, 1])

    with col5:
        # Dotlas work experience with Dotlas as a clickable link and increased font size
        st.markdown(
            """
            <p style="font-size: 28px;">
            I've also worked as a Data Science Intern at <a href="https://www.dotlas.com/" target="_blank">Dotlas</a>. 
            where I've developed web scrapers and data collectors, gathering and analyzing large datasets. 
            I also worked with different LLMs and APIs to automate data collection and analysis, as well as built a 
            <a href="https://catalog.dotlas.com" target="_blank">data-display website</a> for clients.
            </p>
            """, 
            unsafe_allow_html=True
        )

    with col6:
        # Display the Dotlas logo centered vertically with the text
        st.image('main/images/dotlas_logo.png', width=200)

    # Fourth section: Laser Lab at the University of Rochester
    col7, col8 = st.columns([1, 3])

    with col7:
        # Display the Laser Lab image on the right side
        st.markdown("<br>", unsafe_allow_html=True)
        st.image('main/images/laserlab.jpg', width=250)

    with col8:
        # Laser Lab work experience details with increased font size
        st.markdown(
            """
            <p style="font-size: 28px;">
            I've also worked as a Research Assistant at the University of Rochester Laboratory for Laser Energetics, 
            where I utilized COMSOL Multiphysics® for modeling experiments on electromagnetic radiation detection. 
            I explored the use of terahertz radiation to differentiate between healthy and cancerous tissues and 
            evaluated the impact of embedding tissues in paraffin wax to mimic real-life samples.
            </p>
            """, 
            unsafe_allow_html=True
        )
