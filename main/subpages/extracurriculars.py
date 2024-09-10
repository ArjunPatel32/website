import streamlit as st

def display_extracurriculars():
    # Center, enlarge, underline, and italicize the title
    st.markdown("<h1 style='text-align: center; font-size: 48px; text-decoration: underline; font-style: italic;'>Extracurriculars</h1>", unsafe_allow_html=True)
    
    # First section: UAS Berkeley
    col1, col2 = st.columns([3, 1])
    
    with col1:
        st.markdown(
            """
            <p style="font-size: 28px;">
            I am a Telescope Officer at the Undergraduate Astronomy Society at UC Berkeley, operating various telescopes for events. 
            I've been trained in activating and functioning different telescopes, including Treffers, Cassegrain, Newtonian, & EV. I am also responsible for training new Telescope Crew members on telescope operation and maintenance.
            </p>
            """, 
            unsafe_allow_html=True
        )
    with col2:
        st.image('main/images/uas_berk.jpg', width=200)
    
    # Second section: Brighton Fire Department
    col3, col4 = st.columns([1, 3])

    with col3:
        st.image('main/images/brighton_fire_logo.jpg', width=200)

    with col4:
        st.markdown(
            """
            <p style="font-size: 28px;">
            I volunteered as a firefighter with the Brighton Fire Department Explorers, where I trained for about 300 hours, attended biweekly training, and managed recruitment. 
            I also maintained and distributed over $25,000 worth of gear to fellow explorers.
            </p>
            """, 
            unsafe_allow_html=True
        )

    # Third section: SOAR (Sexual Outreach and Advocacy Resources)
    col5, col6 = st.columns([3, 1])

    with col5:
        st.markdown(
            """
            <p style="font-size: 28px;">
            As the Advocacy Director at Sexual Outreach and Advocacy Resources (SOAR), I organized awareness dinners and distributed resources directly to high school students. I also planned city-wide Thanksgiving food drives to combat community malnutrition, donating to over 100 families annually.
            </p>
            """, 
            unsafe_allow_html=True
        )

    with col6:
        st.image('main/images/rise_roc.jpg', width=200)

    # Fourth section: Model United Nations
    col7, col8 = st.columns([1, 3])

    with col7:
        st.image('main/images/model_un.jpg', width=200)

    with col8:
        st.markdown(
            """
            <p style="font-size: 28px;">
            I served as Secretary-General for my high school's Model United Nations club, holding various roles from Page to Delegate to Secretariat. 
            I represented, debated, and defended political initiatives at conferences over NYS, earning Outstanding Delegate and Best Delegate. As a Secretariat, I organized and ran conferences, managing over 200 delegates and 20 staff members.
            </p>
            """, 
            unsafe_allow_html=True
        )
