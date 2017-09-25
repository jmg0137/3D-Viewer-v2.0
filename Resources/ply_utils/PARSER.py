"""
It helps parsing data from a PLY file type.
Just call parse_all with an opened file, and you will be returned
all of its data.
"""
from __future__ import print_function
from struct import unpack
import array


def type_length(elem):
    """
    Return a tuple containing the number of bytes the elem has
    and the character it is represented by.
    """
    if elem == b"char":
        return 1, 'b'
    elif elem == b"uchar":
        return 1, 'B'
    elif elem == b"short":
        return 2, 'h'
    elif elem == b"ushort":
        return 2, 'H'
    elif elem == b"int":
        return 4, 'i'
    elif elem == b"uint":
        return 4, 'I'
    elif elem == b"float":
        return 4, 'f'
    elif elem == b"double":
        return 8, 'd'
    else:
        raise TypeError("The element of type {} is not standard.".format(elem))


def cast_data(data, data_type):
    """
    Return the data casted to data_type
    """
    if data_type in ('b', 'B', 'h', 'H', 'i', 'I'):
        return int(data)
    elif data_type in ('f', 'd'):
        return float(data)
    else:
        raise TypeError("The element of type {} cannot be casted.".format(data_type))


def read_header(pointer):
    """
    Reads the first elements of the header
    """
    #Must be first line.
    assert pointer.readline().split()[0] == b"ply"
    word, encoding, version = next_valid_line(pointer)
    assert word == b"format", "There is no keyword 'format'"
    assert encoding in (b"ascii", b"binary_little_endian", b"binary_big_endian"), \
        "The encoding '{}' is not correct.".format(encoding)
    assert version == b"1.0", "The version {} may be not supported.".\
        format(version)
    return encoding, version


def read_element_descriptions(pointer):
    """
    Reads the elements and its properties
    """
    line = next_valid_line(pointer)
    element_descriptions = []
    while line[0] != b"end_header":
        if line[0] == b"element" and len(line) == 3:
            element_descriptions.append([[line[1], int(line[2])]])
            element_descriptions[-1].append([])
        elif line[0] == b"property":
            prop = [line[-1]]
            prop.extend(line[1:-1])
            element_descriptions[-1][-1].append(prop)
        else:
            raise IOError("The file is not standard")
        line = next_valid_line(pointer)
    return element_descriptions


def read_elements(pointer, descriptions, encoding):
    """
    Reads the elements following the description in the
    descriptions list
    """
    encoding = encoding.lower()
    if encoding == b"ascii":
        return read_elements_ascii(pointer, descriptions)
    elif encoding == b"binary_big_endian":
        return read_elements_endianness(pointer, descriptions, '>')
    elif encoding == b"binary_little_endian":
        return read_elements_endianness(pointer, descriptions, '<')
    else:
        raise IOError("Encoding {} not implemented".format(encoding))


def init_parsing(properties):
    """
    Inits a parsing dict with arrays of the correct size.
    """
    parsing = dict()
    for prop in properties:
        if len(prop) == 4 and prop[1] == b"list":
            parsing[prop[0]] = dict()
            parsing[prop[0]]["length"] = array.array(type_length(prop[2])[1])
            parsing[prop[0]]["data"] = array.array(type_length(prop[3])[1])
        else:
            parsing[prop[0]] = array.array(type_length(prop[1])[1])
    return parsing


def read_elements_ascii(pointer, descriptions):
    """
    Reads the elements if the encoding is ascii
    """
    parsed_elements = dict()
    for element, properties in descriptions:
        element_name = element[0]
        number_items = element[1]

        #First we create the arrays of the types the properties needs.
        parsing = init_parsing(properties)

        #Then we append to the correspondent array the data.
        for _ in range(number_items):
            line = pointer.readline().split()
            line_iter = iter(line)
            for prop in properties:
                if len(prop) == 4 and prop[1] == b"list":
                    length = int(next(line_iter))
                    parsing[prop[0]]["length"].append(length)
                    for _ in range(length):
                        data = next(line_iter)
                        data_type = type_length(prop[3])[1]
                        data = cast_data(data, data_type)
                        parsing[prop[0]]["data"].append(data)
                else:
                    data = next(line_iter)
                    data_type = type_length(prop[1])[1]
                    data = cast_data(data, data_type)
                    parsing[prop[0]].append(data)

        parsed_elements[element_name] = parsing
        print("Finished {} elements.".format(element_name))
    return parsed_elements


def read_elements_endianness(pointer, descriptions, endianness):
    """
    Reads the elements with binary encoding (little or big endian)
    """
    parsed_elements = dict()
    for element, properties in descriptions:
        element_name = element[0]
        number_items = element[1]

        parsing = init_parsing(properties)

       #Then we append to the correspondent array the data.
        for _ in range(number_items):
            for prop in properties:
                if len(prop) == 4 and prop[1] == b"list":
                    length, typ = type_length(prop[2])
                    number_of_reads = unpack(endianness+typ, pointer.read(length))[0]
                    parsing[prop[0]]["length"].append(number_of_reads)
                    length, typ = type_length(prop[3])
                    numbers = unpack(endianness+(typ * number_of_reads), \
                                    pointer.read(length*number_of_reads))
                    parsing[prop[0]]["data"].extend(numbers)
                else:
                    length, typ = type_length(prop[1])
                    read = unpack(endianness+typ, pointer.read(length))[0]
                    parsing[prop[0]].append(read)
        parsed_elements[element_name] = parsing
        print("{} elements read.".format(element_name))
    return parsed_elements


def next_valid_line(pointer):
    """
    Returns a tuple with the elements into a line if it
    isn't empty
    """
    #If we use binary read mode, readline dont give us \n or \r alone.
    line = pointer.readline()
    #We discard the comments
    if line.split()[0] == b"comment":
        return next_valid_line(pointer)
    else:
        return line.split()


def parse_all(pointer):
    """
    Reads all the file and returns all the information the program
    is capable of read
    Important: the pointer must be of a file opened on binary mode.
    """
    encoding, version = read_header(pointer)
    element_descriptions = read_element_descriptions(pointer)
    parsed_elements = read_elements(pointer, element_descriptions, encoding)
    return encoding, version, element_descriptions, parsed_elements
