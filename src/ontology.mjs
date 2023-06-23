import Lytonepal from './ontology/lytonepal.mjs';
import LytonepalProjects from './ontology/lytonepal-projects.mjs';
import * as $rdf from 'rdflib';

const onto = new $rdf.Store();
onto.addAll(Lytonepal.statements);
onto.addAll(LytonepalProjects.statements);

export default onto;

// Local Variables:
// mode: js
// End:
