import streamlit as st
import base64

def get_base64_of_bin_file(bin_file):
    with open(bin_file, 'rb') as f:
        data = f.read()
    return base64.b64encode(data).decode()

def set_png_as_page_bg(png_file):
    bin_str = get_base64_of_bin_file(png_file)
    page_bg_img = '''
    <style>
    body {
    background-image: url("data:image/png;base64,%s");
    background-size: cover;
    }
    </style>
    ''' % bin_str
    
    st.markdown(page_bg_img, unsafe_allow_html=True)
    return

def load_images():
    profile_pic = 'main/images/profile_pic.jpg'
    interstellar_pic = 'main/images/interstellar_pic.jpg'
    return profile_pic, interstellar_pic

def create_footer():
    st.markdown("""
    <footer style='background-color: black; padding: 10px 0; text-align: center; color: white;'>
        <p>&copy; 2024 Arjun Patel. All rights reserved.</p>
    </footer>
    """, unsafe_allow_html=True)
