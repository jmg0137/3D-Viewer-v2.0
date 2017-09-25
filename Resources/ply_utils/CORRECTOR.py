"""
Corrects the data of a PLY file structured from the
already parsed elements with PARSER.
"""
from __future__ import print_function
import array
from bitarray import bitarray

def reverse_enumerate(sequence):
    """
    Generator that returns the tuple(index, elem) for the reversed
    input sequence. Also, the index is descending and not ascending.
    """
    index = len(sequence)-1
    for elem in reversed(sequence):
        yield index, elem
        index -= 1


def correct(parsed_elements, element_descriptions):
    """
    Correct the parsed elements by delete the unreferenced points
    and rearanging the indices of the list of vertices.
    """
    #Common stuff, just to write once this mess
    faces = parsed_elements[b"face"][b"vertex_indices"]["data"]

    #First we make an array of bools which contains whether
    #a face is referenced or not
    x_vertices = parsed_elements[b"vertex"][b"x"]
    vertices_present = bitarray(len(x_vertices))
    vertices_present.setall(False)
    for face_index in faces:
        vertices_present[face_index] = True
    #And we assure it has the same number of positives
    #that unique faces there are
    assert vertices_present.count() == len(set(faces))
    print("References calculated.")

    #Next we create an array that will determine wich is the size
    #there are between the vertices
    to_substract = array.array('i')
    counter = int(0)
    for vertix_present in vertices_present:
        if not vertix_present:
            counter += 1
        to_substract.append(counter)
    assert len(to_substract) == len(vertices_present), \
           "The quantity of items we want to substract is different\
           of the quantity of items we have to do."
    #Then we susbtract it, so there are no holes in between.
    for index, face in enumerate(faces):
        faces[index] -= to_substract[face]
    print("Holes on index deleted.")

    #Finally, we delete the unreferenced items
    for name, prop in parsed_elements[b"vertex"].items():
        #We have to do it in reverse way to do it properly.
        for index, vertix_present in reverse_enumerate(vertices_present):
            if not vertix_present:
                del prop[index]
        #After doing the deletions, check everything is fine.
        assert len(prop) == vertices_present.count(True), \
               "The property {} has {} less elements that it should.". \
               format(name, vertices_present.count(True) - len(prop))
        assert set(faces) == set(range(len(prop))), \
               "The indexes still remains unaligned 0 <= i < len(index_list)"
        print("{} property purged.".\
              format(name))

    real_vertices_number = vertices_present.count(True)
    element_descriptions[0][0][1] = real_vertices_number
    print("Vertex quantity updated")
