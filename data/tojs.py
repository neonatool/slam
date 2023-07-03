from rdflib import URIRef, BNode, Literal, Graph
from rdflib.namespace import OWL
from xml.sax.saxutils import escape, quoteattr

for ontology in ['lytonepal.ttl', 'lytonepal-projects.ttl']:
    g = Graph().parse(ontology)
    base = g.absolutize(ontology)
    for additional_context in ['./rdf.ttl',
                               './rdfs.ttl',
                               './doap.rdf',
                               './owl.ttl',
                               './intl.ttl',
                               './simple-inference.ttl']:
        g.parse(additional_context)
    for indirect, inverse_of, direct in g.triples((None, OWL.inverseOf, None)):
        g.add((direct, OWL.inverseOf, indirect))
        for s, p, o in g.triples((None, direct, None)):
            g.add((o, indirect, s))
        for s, p, o in g.triples((None, indirect, None)):
            g.add((o, direct, s))
    with open('../src/ontology/{}.mjs'.format(ontology.removesuffix('.ttl')), 'w') as f:
        f.write('import * as $rdf from \'rdflib\';\n')
        f.write('const store = new $rdf.Store();\n')
        for s, p, o in g:
            f.write('store.add(')
            sep = ''
            for term in [s, p, o]:
                if isinstance(term, BNode):
                    f.write('{}new $rdf.BlankNode ({})'.format(sep, repr(str(term))))
                elif isinstance(term, URIRef):
                    uri = str(term)
                    if uri.startswith(base + '#'):
                        uri = ('https://localhost/'
                               + ontology.removesuffix('.ttl')
                               + uri.removeprefix(base))
                    f.write('{}new $rdf.NamedNode({})'.format(sep, repr(uri)))
                elif isinstance(term, Literal) and term.language is not None:
                    f.write('{}new $rdf.Literal({}, {})'
                            .format(sep, repr(str(term)), repr(term.language)))
                elif isinstance(term, Literal) and term.datatype is not None:
                    f.write('{}new $rdf.Literal({}, null, {})'
                            .format(sep, repr(str(term)), repr(str(term.datatype))))
                elif isinstance(term, Literal):
                    f.write('{}new $rdf.Literal({})'
                            .format(sep, repr(str(term))))
                sep = ', '
            f.write(');\n')
        f.write('export default store;\n')
