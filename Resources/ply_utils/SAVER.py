"""
Persists the data of a model into a file with PLY format.
"""
from __future__ import print_function
from struct import pack
from .PARSER import type_length


def write_element_descriptions(pointer, element_descriptions):
    """
    Writes the descriptions of the elements into the file.
    These are always on ASCII encoding, never binary.
    """
    for element in element_descriptions:
        pointer.write(b"element " + element[0][0] + \
                      b" " + bytes(str(element[0][1]), encoding="utf-8") + \
                      b"\n")
        for prop in element[1]:
            pointer.write(b"property " + prop[1] + b" ")
            if prop[1] == b"list":
                pointer.write(prop[2] + b" " + prop[3] + b" " + \
                              prop[0] + b"\n")
            else:
                pointer.write(prop[0] + b"\n")


def write_header(pointer, encoding, version, descriptions):
    """
    Writes the header into the file.
    """
    pointer.write(b"ply\n")
    pointer.write(b"format " + encoding + b" " + version + b"\n")
    write_element_descriptions(pointer, descriptions)
    pointer.write(b"end_header\n")


def write_elements(pointer, encoding, descriptions, elements):
    """
    Choose which method to use to write the elements into the file (either
    ASCII or binary_little_endian or binary_big_endian).
    """
    encoding = encoding.lower()
    if encoding == b"ascii":
        return write_elements_ascii(pointer, descriptions, elements)
    elif encoding == b"binary_big_endian":
        return write_elements_endianness(pointer, descriptions, elements, '>')
    elif encoding == b"binary_little_endian":
        return write_elements_endianness(pointer, descriptions, elements, '<')
    else:
        raise IOError("Encoding {} not implemented".format(encoding))


def write_elements_ascii(pointer, descriptions, elements):
    """
    Writes the elements into the file in ASCII format
    """
    for (element_name, number_items), properties in descriptions:

        for counter in range(number_items):
            for index, prop in enumerate(properties):
                element = elements[element_name][prop[0]]
                string = str()
                if len(prop) == 4 and prop[1] == b"list":
                    number_of_writes = element["length"][counter]
                    numbers = get_numbers(element["data"], counter, number_of_writes)
                    string += str(number_of_writes)
                    for index in numbers:
                        string += " " + str(index)
                else:
                    data = element[counter]
                    if index == 0:
                        string += str(data)
                    else:
                        string += " " + str(data)
                pointer.write(bytes(string, encoding="utf-8"))
            pointer.write(b"\n")
        print("{} written down.". \
              format(element_name))

def write_elements_endianness(pointer, descriptions, elements, endianness):
    """
    Write the elements to the file, either on binary_little_endian or
    binary_big_endian.
    """
    for (element_name, number_items), properties in descriptions:

        counter = int()
        for _ in range(number_items):
            for prop in properties:
                element = elements[element_name][prop[0]]
                if len(prop) == 4 and prop[1] == b"list":
                    number_of_writes = element["length"][counter]
                    numbers = get_numbers(element["data"], counter, number_of_writes)
                    _, typ = type_length(prop[2])
                    pointer.write(pack(endianness+typ, number_of_writes))
                    _, typ = type_length(prop[3])
                    pointer.write(pack(endianness+(typ * number_of_writes), *numbers))
                else:
                    _, typ = type_length(prop[1])
                    numbers = element[counter]
                    pointer.write(pack(endianness+typ, numbers))
            counter += 1
        print("{} elements written down.". \
              format(element_name))

def get_numbers(data, counter, number_of_writes):
    return data[counter*3:(counter*3)+number_of_writes]