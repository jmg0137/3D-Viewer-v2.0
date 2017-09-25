"""
Make the user able to correct a PLY file entirely with a command.
"""
from __future__ import print_function

def process_ply_file(filename, force_encoding=None):
    """
    Processes a PLY file and stores it with the appropiated encoding.
    """
    from .PARSER import parse_all
    from .CORRECTOR import correct
    from .SAVER import write_header, write_elements
    allowed_list = (b"binary_big_endian", b"binary_little_endian", b"ascii")
    if force_encoding is None:
        print("Info: do you want to force encoding? Try one of these: {}".format(allowed_list))
    elif force_encoding not in allowed_list:
        print("Error: force_encoding parameter should be one of {}".format(allowed_list))
        return

    with open(filename, "rb") as file_pointer:
        encoding, version, element_descriptions, parsed_elements = \
                  parse_all(file_pointer)

    if force_encoding:
        encoding = force_encoding

    correct(parsed_elements, element_descriptions)

    destination_file = filename[:-4] + "_corrected" + filename[-4:]
    with open(destination_file, "wb") as file_pointer:
        write_header(file_pointer, encoding, version, element_descriptions)
        write_elements(file_pointer, encoding, element_descriptions, parsed_elements)
        print("Result in file {}.".\
              format(destination_file))

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        FORCE_ENCODING = sys.argv[2]
        FILENAME = sys.argv[1]
    if len(sys.argv) > 1:
        FORCE_ENCODING = None
        FILENAME = sys.argv[1]
    else:
        print("Parameters: filename & encoding")
        sys.exit()
    process_ply_file(FILENAME, FORCE_ENCODING)
