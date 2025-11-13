
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SessionData } from '@/lib/types';
import { checkComprehension, getQualityFlags } from '@/lib/quality-flags';

type CrossTabulationProps = {
    sessions: SessionData[] | null;
};

const selectableVariables = [
    { key: 'advisorySource', label: 'Advisory Source' },
    { key: 'linguisticFrame', label: 'Linguistic Frame' },
    { key: 'scenario', label: 'Scenario' },
    { key: 'objectiveChoice', label: 'Objective Choice' },
    { key: 'sourceAttribution', label: 'Manipulation: Source Attribution' },
    { key: 'comprehension_org', label: 'Comprehension: Organization' },
    { key: 'comprehension_horizon', label: 'Comprehension: Horizon' },
    { key: 'flag_comprehension', label: 'Flag: Comprehension' },
    { key: 'flag_viewtime', label: 'Flag: View Time' },
    { key: 'flag_straightline', label: 'Flag: Straight-Lining' },
    { key: 'role_level', label: 'Demographic: Role Level' },
    { key: 'industry', label: 'Demographic: Industry' },
    { key: 'risk_appetite', label: 'Demographic: Risk Appetite' },
];

const getVariableValue = (session: SessionData, key: string): string => {
    const qualityFlags = getQualityFlags(session);

    switch (key) {
        // Condition variables
        case 'advisorySource': return session.condition?.advisorySource || 'N/A';
        case 'linguisticFrame': return session.condition?.linguisticFrame || 'N/A';
        case 'scenario': return session.condition?.scenario || 'N/A';
        
        // Choice variables
        case 'objectiveChoice': {
            const choice = session.objectiveChoice;
            if (!choice) return 'No Choice';
            if (choice.includes('Option A')) return 'A';
            if (choice.includes('Option B')) return 'B';
            if (choice.includes('Option C')) return 'C';
            if (choice.includes('I do not know')) return 'D';
            return 'N/A';
        }
        
        // Check variables
        case 'sourceAttribution': return session.manipulationChecks?.sourceAttribution || 'N/A';
        case 'comprehension_org': return checkComprehension(session).isOrgCorrect ? 'Correct' : 'Incorrect';
        case 'comprehension_horizon': return checkComprehension(session).isHorizonCorrect ? 'Correct' : 'Incorrect';

        // Flag variables
        case 'flag_comprehension': return qualityFlags.includes('flag_comprehension') ? 'Flagged' : 'Not Flagged';
        case 'flag_viewtime': return qualityFlags.includes('flag_viewtime') ? 'Flagged' : 'Not Flagged';
        case 'flag_straightline': return qualityFlags.includes('flag_straightline') ? 'Flagged' : 'Not Flagged';

        // Demographics
        case 'role_level': return session.initialAssessments?.roleAndExperience?.q1 || 'N/A';
        case 'industry': return session.initialAssessments?.organizationalProfile?.q1 || 'N/A';
        case 'risk_appetite': return session.initialAssessments?.organizationalProfile?.q5 || 'N/A';

        default: return 'N/A';
    }
};

export default function CrossTabulation({ sessions }: CrossTabulationProps) {
    const [rowVar, setRowVar] = useState<string>('advisorySource');
    const [colVar, setColVar] = useState<string>('objectiveChoice');

    const crosstabData = useMemo(() => {
        if (!sessions || !rowVar || !colVar) return null;

        const rowCategories = [...new Set(sessions.map(s => getVariableValue(s, rowVar)))].sort();
        const colCategories = [...new Set(sessions.map(s => getVariableValue(s, colVar)))].sort();

        const table: Record<string, Record<string, number>> = {};
        rowCategories.forEach(rowCat => {
            table[rowCat] = {};
            colCategories.forEach(colCat => {
                table[rowCat][colCat] = 0;
            });
        });

        sessions.forEach(session => {
            const rowValue = getVariableValue(session, rowVar);
            const colValue = getVariableValue(session, colVar);
            if (rowValue in table && colValue in table[rowValue]) {
                table[rowValue][colValue]++;
            }
        });
        
        return { table, rowCategories, colCategories };
    }, [sessions, rowVar, colVar]);
    
    if (!sessions) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">Loading session data...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <label className="text-sm font-medium mb-2 block">Row Variable</label>
                        <Select value={rowVar} onValueChange={setRowVar}>
                            <SelectTrigger><SelectValue placeholder="Select a variable" /></SelectTrigger>
                            <SelectContent>
                                {selectableVariables.map(v => <SelectItem key={v.key} value={v.key} disabled={v.key === colVar}>{v.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-sm font-medium mb-2 block">Column Variable</label>
                        <Select value={colVar} onValueChange={setColVar}>
                            <SelectTrigger><SelectValue placeholder="Select a variable" /></SelectTrigger>
                            <SelectContent>
                                {selectableVariables.map(v => <SelectItem key={v.key} value={v.key} disabled={v.key === rowVar}>{v.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {crosstabData && (
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold">{selectableVariables.find(v => v.key === rowVar)?.label}</TableHead>
                                    {crosstabData.colCategories.map(cat => <TableHead key={cat} className="text-right">{cat}</TableHead>)}
                                    <TableHead className="text-right font-bold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {crosstabData.rowCategories.map(rowCat => {
                                    const rowTotal = crosstabData.colCategories.reduce((sum, colCat) => sum + crosstabData.table[rowCat][colCat], 0);
                                    return (
                                        <TableRow key={rowCat}>
                                            <TableCell className="font-medium">{rowCat}</TableCell>
                                            {crosstabData.colCategories.map(colCat => (
                                                <TableCell key={colCat} className="text-right">{crosstabData.table[rowCat][colCat]}</TableCell>
                                            ))}
                                            <TableCell className="text-right font-bold">{rowTotal}</TableCell>
                                        </TableRow>
                                    )
                                })}
                                <TableRow className="bg-muted/50 font-bold">
                                    <TableCell>Total</TableCell>
                                     {crosstabData.colCategories.map(colCat => {
                                        const colTotal = crosstabData.rowCategories.reduce((sum, rowCat) => sum + crosstabData.table[rowCat][colCat], 0);
                                        return <TableCell key={colCat} className="text-right">{colTotal}</TableCell>
                                     })}
                                     <TableCell className="text-right">{sessions.length}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
