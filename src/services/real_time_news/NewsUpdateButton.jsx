import React, { useState } from 'react';

/**
 * React Component for News Update Button
 * Add this to your main dashboard or admin panel
 */

const NewsUpdateButton = ({ onUpdateComplete }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [updateResults, setUpdateResults] = useState(null);

    const updateAllNews = async () => {
        setIsUpdating(true);
        setUpdateResults(null);

        try {
            const response = await fetch('/api/news/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ updateAll: true })
            });

            const result = await response.json();
            
            if (result.success) {
                setLastUpdate(new Date());
                setUpdateResults(result);
                
                // Call parent callback if provided
                if (onUpdateComplete) {
                    onUpdateComplete(result);
                }
                
                // Show success message
                alert(`✅ News updated successfully!\n${result.companiesUpdated} companies updated`);
            } else {
                alert(`❌ Update failed: ${result.message || result.error}`);
            }
        } catch (error) {
            console.error('Error updating news:', error);
            alert('❌ Network error occurred while updating news');
        } finally {
            setIsUpdating(false);
        }
    };

    const updateSpecificCompanies = async (companyIds) => {
        setIsUpdating(true);
        
        try {
            const response = await fetch('/api/news/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ companyIds })
            });

            const result = await response.json();
            
            if (result.success) {
                setLastUpdate(new Date());
                setUpdateResults(result);
                
                if (onUpdateComplete) {
                    onUpdateComplete(result);
                }
            }
        } catch (error) {
            console.error('Error updating specific companies:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="news-update-section">
            <div className="update-controls">
                <button
                    onClick={updateAllNews}
                    disabled={isUpdating}
                    className={`update-btn ${isUpdating ? 'updating' : ''}`}
                    style={{
                        backgroundColor: isUpdating ? '#6b7280' : '#ef4444',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {isUpdating ? (
                        <>
                            <div className="spinner" style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid #ffffff40',
                                borderTop: '2px solid #ffffff',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            Updating News...
                        </>
                    ) : (
                        <>
                            📰 Update All Company News
                        </>
                    )}
                </button>
            </div>

            {lastUpdate && (
                <div className="update-status" style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '6px',
                    fontSize: '14px'
                }}>
                    <div style={{ fontWeight: '600', color: '#0369a1' }}>
                        ✅ Last Update: {lastUpdate.toLocaleString()}
                    </div>
                    
                    {updateResults && (
                        <div style={{ marginTop: '8px', color: '#0369a1' }}>
                            <div>Companies Updated: {updateResults.companiesUpdated}</div>
                            {updateResults.companiesWithErrors > 0 && (
                                <div>Errors: {updateResults.companiesWithErrors}</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {updateResults && updateResults.updateResults && (
                <div className="update-details" style={{
                    marginTop: '16px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '12px'
                }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                        Update Details:
                    </h4>
                    {updateResults.updateResults.map((result, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '4px 0',
                            borderBottom: index < updateResults.updateResults.length - 1 ? '1px solid #f3f4f6' : 'none'
                        }}>
                            <span style={{ fontSize: '13px' }}>{result.name}</span>
                            <span style={{
                                fontSize: '12px',
                                color: result.status === 'success' ? '#059669' : '#dc2626',
                                fontWeight: '500'
                            }}>
                                {result.status === 'success' 
                                    ? `✅ ${result.articlesFound} articles` 
                                    : '❌ Error'
                                }
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default NewsUpdateButton;

// Usage example in your main component:
/*
import NewsUpdateButton from './components/NewsUpdateButton';

function Dashboard() {
    const handleNewsUpdateComplete = (result) => {
        console.log('News update completed:', result);
        // Refresh your company list or show notification
        // You might want to refetch companies from Supabase here
    };

    return (
        <div>
            <h1>ASBhive Dashboard</h1>
            <NewsUpdateButton onUpdateComplete={handleNewsUpdateComplete} />
            {/* Your other components */}
        </div>
    );
}
*/

