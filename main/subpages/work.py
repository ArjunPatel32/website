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

    col1, col2 = st.columns([1, 4])

    with col1:
        st.image('main/images/AIN_logo.png', width=200)
    
    with col2:
        st.markdown(
            """
            <p style="font-size: 28px;">
            I currently work as a Quantitative Analyst Intern at AIN Ventures, where I develop Monte Carlo simulations to 
            model venture portfolio outcomes and collaborate on integrating AI-driven probabilistic modeling into internal forecasting systems.
            Its very exciting to see the integration of AI into the VC industry and see the hundreds of startups that are being built.
            </p>
            """,
            unsafe_allow_html=True
        )

    col3, col4 = st.columns([3, 1])

    with col3:
        st.markdown(
            """
            <p style="font-size: 28px;">
            I was a Quantitative Trading Intern as part of Flow Traders’ Ascent program, where I 
            collaborated with peers in a simulated trading competition and received mentorship from 
            experienced trading professionals. We also learned about market-making strategies, high-frequency 
            trading concepts, and real-time risk management techniques.
            </p>
            """,
            unsafe_allow_html=True
        )

    with col4:
        st.image('main/images/rubin_observatory.jpg', width=250)

    col5, col6 = st.columns([1, 4])

    with col5:
        st.image('main/images/flow_logo.jpg', width=200)
    
    with col6:
        st.markdown(
            """
            <p style="font-size: 28px;">
            I was a Quantitative Trading Intern as part of Flow Traders’ Ascent program, where I 
            collaborated with peers in a simulated trading competition and received mentorship from 
            experienced trading professionals. We also learned about market-making strategies, high-frequency 
            trading concepts, and real-time risk management techniques.
            </p>
            """,
            unsafe_allow_html=True
        )
    
    
    col7, col8 = st.columns([1, 4])

    with col7:
        st.image('main/images/nasa_logo.png', width=200)

    with col8:
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

    col9, col10 = st.columns([3, 1])

    with col9:
        st.markdown(
            """
            <p style="font-size: 28px;">
            At NASA SPORES – HWO, I served as a Data Analyst contributing to exoplanet detection research. I processed radial velocity 
            data using Python to refine constraints on exoplanet mass and orbital properties. I also identified and standardized 
            datasets from spectrographs such as HIRES/Keck and HARPS/ESO. My contributions will be part of an upcoming research paper.
            </p>
            """,
            unsafe_allow_html=True
        )

    with col10:
        st.image('main/images/nasa_logo.png', width=200)

    # Fifth section: Dotlas
    col11, col12 = st.columns([1, 4])

    with col11:
        st.image('main/images/dotlas_logo.png', width=200)
    
    with col12:
        st.markdown(
            """
            <p style="font-size: 28px;">
            I was a Data Science Intern at <a href="https://www.dotlas.com/" target="_blank">Dotlas</a>, where I 
            developed web scrapers and data collectors, gathering and analyzing large datasets. I also worked with 
            different LLMs and APIs to automate data collection and analysis, as well as built a 
            <a href="https://catalog.dotlas.com" target="_blank">data-display website</a> for clients.
            </p>
            """,
            unsafe_allow_html=True
        )

    
