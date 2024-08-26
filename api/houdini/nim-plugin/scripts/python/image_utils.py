# Portions Copyright MLOPS - copied under terms of BSD 3-Clause License
# https://github.com/Bismuth-Consultancy-BV/MLOPs?tab=BSD-3-Clause-1-ov-file#BSD-3-Clause-1-ov-file

import numpy
from PIL import Image
import requests
from io import BytesIO
import base64

def colors_numpy_array_to_pil(input_colors, scale_factor=1.0):
    # Transpose into (width, height, channels)
    input_colors = input_colors.transpose(1, 2, 0)
    # Gamma Correct
    input_colors = pow(input_colors, 1.0 / scale_factor)
    # Convert to RGB space
    input_colors = (input_colors * 255).round().astype("uint8")
    return Image.fromarray(input_colors)


def pil_to_colors_numpy_array(pil_image):
    # Convert to Numpy Array
    input_colors = numpy.asarray(pil_image)
    # Convert to 0-1 space
    input_colors = input_colors.astype(numpy.uint8) / 255
    # Transpose into (channels, width, height)
    input_colors = input_colors.transpose(2, 0, 1)
    return input_colors


def ensure_same_pil_image_dimensions(pil_image1, pil_image2):
    # Get the sizes of the images
    size1 = pil_image1.size
    size2 = pil_image2.size

    # Check if the sizes are different
    if size1 != size2:
        # Determine the maximum size among the two images
        max_width = max(size1[0], size2[0])
        max_height = max(size1[1], size2[1])

        # Resize the images to the maximum size
        pil_image1 = pil_image1.resize((max_width, max_height))
        pil_image2 = pil_image2.resize((max_width, max_height))

    return pil_image1, pil_image2


def colored_points_to_numpy_array(geo):
    width = geo.attribValue("image_dimension")[0]
    height = geo.attribValue("image_dimension")[1]

    r = numpy.array(geo.pointFloatAttribValues("r"), dtype=numpy.float32).reshape(
        height, width
    )
    g = numpy.array(geo.pointFloatAttribValues("g"), dtype=numpy.float32).reshape(
        height, width
    )
    b = numpy.array(geo.pointFloatAttribValues("b"), dtype=numpy.float32).reshape(
        height, width
    )

    input_colors = numpy.stack((r, g, b), axis=0)
    return input_colors


def pil_to_colored_points(geo, pil_image, scale_factor=1.0):
    cd_array = pil_to_colors_numpy_array(pil_image)
    numpy_array_to_colored_points(geo, cd_array, scale_factor)


def numpy_array_to_colored_points(geo, cd_array, scale_factor=255.0):
    # Split the color data into separate "r", "g", and "b" arrays
    cd_array /= scale_factor
    r_attrib = cd_array[0, :, :].ravel()
    g_attrib = cd_array[1, :, :].ravel()
    b_attrib = cd_array[2, :, :].ravel()

    # Set the "r", "g", and "b" attributes on the points
    geo.setPointFloatAttribValues("r", tuple(r_attrib.tolist()))
    geo.setPointFloatAttribValues("g", tuple(g_attrib.tolist()))
    geo.setPointFloatAttribValues("b", tuple(b_attrib.tolist()))

def pil_to_Cd_points(geo, pil_image, scale_factor=1.0):
    cd_array = pil_to_colors_numpy_array(pil_image)
    # Split the color data into separate "r", "g", and "b" arrays

    # Transpose the cd_array to have the shape (num_points, num_components)
    cd_array = cd_array.transpose(1, 2, 0)

    # Flatten the cd_array and scale down the color data
    cd_attrib = cd_array.reshape(-1, 3) / scale_factor

    i = 0
    for point in geo.points():
        point.setAttribValue("Cd", cd_attrib[i])
        i = i + 1


def prep_for_seamless(image):


    def split_image(image, direction):

        # Get the width and height of the image
        width, height = image.size

        if direction == "horizontal only":
            # Calculate the midpoint
            midpoint = width // 2

            # Split the image into two halves
            left_half = image.crop((0, 0, midpoint, height))
            right_half = image.crop((midpoint, 0, width, height))

            # Return the two halves as separate images
            return left_half, right_half

        elif direction == "vertical only":
            # Calculate the midpoint
            midpoint = height // 2

            # Split the image into two halves
            top_half = image.crop((0, 0, width, midpoint))
            bottom_half = image.crop((0, midpoint, width, height))

            # Return the two halves as separate images
            return top_half, bottom_half
        else:
            raise Exception("Direction variable must be either horizontal, vertical, or both")

    def merge_images(first_half, last_half, direction, flip_sides=False):

        # Get the width and height of the first half (assuming both halves have the same dimensions)
        width, height = first_half.size

        # Create a new image
        merged_image = None

        if direction == "horizontal only":
            # Create a new image with double the width
            merged_image = Image.new("RGB", (width * 2, height))
            height = 0
        elif direction == "vertical only":
            # Create a new image with double the height
            merged_image = Image.new("RGB", (width, height * 2))
            width = 0
        else:
            raise Exception("Direction variable must be either horizontal, vertical, or both")

        # Determine the order in which to paste the halves
        if flip_sides:
            merged_image.paste(last_half, (0, 0))
            merged_image.paste(first_half, (width, height))
        else:
            merged_image.paste(first_half, (0, 0))
            merged_image.paste(last_half, (width, height))

        # Return the merged image
        return merged_image


    first_half, last_half = split_image(image, "horizontal only")

    part_A, part_B = split_image(first_half, "vertical only")
    part_C, part_D = split_image(last_half, "vertical only")

    top_half = merge_images(part_B, part_D, "horizontal only", flip_sides=True)
    bottom_half = merge_images(part_A, part_C, "horizontal only", flip_sides=True)

    image = merge_images(top_half, bottom_half, "vertical only", flip_sides=False)


    return image

def inpaint_image(
        inpaint_url,
        image: Image.Image, 
        map: Image.Image, 
        prompt=None, 
        negative_prompt=None,
        guidance_scale=7, 
        num_inference_steps=50):
    
    # Default prompt values
    if prompt is None:
        prompt = ["inpaint in the same style as the rest of the image"]
    
    if negative_prompt is None:
        negative_prompt = ["blurry, different, seams"]
    
    # Convert images to base64
    buffered_image = BytesIO()
    image.save(buffered_image, format="PNG")
    image_base64 = base64.b64encode(buffered_image.getvalue()).decode("utf-8")
    
    buffered_map = BytesIO()
    map.save(buffered_map, format="PNG")
    map_base64 = base64.b64encode(buffered_map.getvalue()).decode("utf-8")
    
    # Prepare the payload
    payload = {
        "image": image_base64,
        "map": map_base64,
        "prompt": prompt,
        "guidance_scale": guidance_scale,
        "negative_prompt": negative_prompt,
        "num_inference_steps": num_inference_steps
    }
    
    # Make the POST request to the API
    response = requests.post(inpaint_url, json=payload)
    
    # Check for success
    if response.status_code == 200:
        # Decode the resulting image from base64
        edited_image_base64 = response.json()['image']
        edited_image_data = base64.b64decode(edited_image_base64)
        edited_image = Image.open(BytesIO(edited_image_data))
        return edited_image
    else:
        # Handle error
        print(f"Error: {response.status_code}, {response.text}")
        return None